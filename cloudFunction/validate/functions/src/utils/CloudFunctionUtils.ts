import { GoogleAuth } from "google-auth-library";

import { metaData } from "./YouTubeUrlUtils";

const googleAuth = new GoogleAuth()
const targetAudience = "https://asia-southeast1-sentistream-420115.cloudfunctions.net/analyze"
const url = targetAudience


export async function submitTask( data: metaData ): Promise<string> {
    const client = await googleAuth.getIdTokenClient(targetAudience);
  
    // Alternatively, one can use `client.idTokenProvider.fetchIdToken`
    // to return the ID Token.
    const res = await client.request<string>({url: url,
                                      method: 'POST',
                                      data: data
                        });
    
    return res.data
  }
  