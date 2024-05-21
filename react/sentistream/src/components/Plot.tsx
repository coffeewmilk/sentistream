import * as Plot from "@observablehq/plot";
import {useEffect, useRef} from "react";

import { resultData } from "../utils/Firebase-storage";

export function DoPlot( {data}: {data: resultData[]} ) {
  const containerRef = useRef<HTMLDivElement>(null);

  // handle none data
  useEffect(() => {
    if (data === undefined) return;
    
    const plot = Plot.plot({
      width: 700,
      marginLeft: 50,
      marginRight: 100,
      y: {grid: true},
      facet: {data: data, y:"finished_sentiment", grid:true},
      marks: [
        Plot.rectY(data, Plot.binX({y: "count"}, {x: "time_seconds"})),
        Plot.ruleY([0])
      ]
    });
    if (containerRef.current) {
        containerRef.current.append(plot);
    }
    return () => plot.remove();
  }, [data]);

  return (<div className="" ref={containerRef} />)
}