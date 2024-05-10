import axios from 'axios';

// this is the modified version of the function form https://github.com/dangdungcntt/youtube-stream-url/tree/master
const getVideoId = ( url: string ) => {
    let opts = { fuzzy: true };

    if (/youtu\.?be/.test(url)) {

        // Look first for known patterns
        let i;
        let patterns = [
            /youtu\.be\/([^#\&\?]{11})/, // youtu.be/<id>
            /\?v=([^#\&\?]{11})/, // ?v=<id>
            /\&v=([^#\&\?]{11})/, // &v=<id>
            /embed\/([^#\&\?]{11})/, // embed/<id>
            /\/v\/([^#\&\?]{11})/ // /v/<id>
        ];

        // If any pattern matches, return the ID
        for (i = 0; i < patterns.length; ++i) {
            if (patterns[i].test(url)) {
                let execd = patterns[i].exec(url)
                return (execd? execd[1]: null)
            }
        }

        if (opts.fuzzy) {
            // If that fails, break it apart by certain characters and look
            // for the 11 character key
            let tokens = url.split(/[\/\&\?=#\.\s]/g);
            for (i = 0; i < tokens.length; ++i) {
                if (/^[^#\&\?]{11}$/.test(tokens[i])) {
                    return tokens[i];
                }
            }
        }
    }

    return null;
};

// this is the modified version of the function form https://github.com/dangdungcntt/youtube-stream-url/tree/master
const resolvePlayerResponse = (watchHtml: string) => {
    
    if (!watchHtml) {
        throw new Error("Html empty");
    }

    let matches = watchHtml.match(/ytInitialPlayerResponse = (.*)}}};/);

    if (!matches) { throw new Error("Unable to resolve player response")}
    return matches[1] + '}}}';
}

// might be better off with regex?
const resolveInitialData = (watchHtml: string) => {
    
    if (!watchHtml) {
        throw new Error("Html empty");
    }

    let matches = watchHtml.match(/ytInitialData = (.*)}}}};/);

    if (!matches) { throw new Error("Unable to resolve Initial data")}
    return matches[1] + '}}}}';
}



// function jsonObjectSearch ({json, path = [], target}: {json: any, path?: string[], target:string}): string[] | undefined {
    
//     for (const [key, value] of Object.entries(json)) {
        
//         if (key == target) {return path.concat([key])}

//         else if (Array.isArray(value)) {
//             let i = 0;
//             while (i < value.length) {
//                 const result = jsonObjectSearch({json: value[i], path: (path.concat([String(i)])), target: target});
//                 if (result) {return result}
//                 i++;
//             }
//         }

//         else if (typeof value === "object" && value !== null) {
//             const result = jsonObjectSearch({json: value, path: path.concat([key]), target: target});
//             if (result) {return result}
//         }

//     }
//     return undefined
// }


// this is the modified version of the function form https://github.com/dangdungcntt/youtube-stream-url/tree/master
const urlValidation = async ( url: string ) => {

    let videoId = getVideoId(url);

    if (!videoId) {throw new Error("Invalid url")};

    let ytApi = 'https://www.youtube.com/watch';

    const response = await axios.get(ytApi, {
        params: { v: videoId }
    });

    if (!response || response.status != 200 || !response.data) {
        const error = new Error('Cannot get youtube video response')
        // error.cause = response;
        throw error;
    }

    let ytInitialPlayerResponse = resolvePlayerResponse(response.data);

    let parsedResponse = JSON.parse(ytInitialPlayerResponse);

    if (!parsedResponse.videoDetails.isLiveContent) {throw new Error("Not a live content");}

    if (parsedResponse.microformat.playerMicroformatRenderer.liveBroadcastDetails.isLiveNow) {
        throw new Error("Only ended live supported");
    }

    let ytInitialData = resolveInitialData(response.data);

    let initialData = JSON.parse(ytInitialData);

    const liveChatRendererComponent = initialData.contents
                                               .twoColumnWatchNextResults
                                               .conversationBar
                                               .liveChatRenderer
                                               ?.isReplay

    if (!liveChatRendererComponent) {
            throw new Error("Replay is disabled")
        }


    const details = parsedResponse.videoDetails

    return {
        url : url,
        videoId: details.videoId,
        title: details.title,
        lengthSeconds: details.lengthSeconds,
        channelId: details.channelId,
        viewCount: details.viewCount,
        author: details.author
    }
};

export default urlValidation
