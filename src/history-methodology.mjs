/**
 * Historical mathematical signature checks for the 40-chart Atlas.
 *
 * These rules are hand-authored interpretations of established chart uses,
 * NOT statistical estimates of historical chart popularity or AI predictions.
 * Validation is conservative: compatible schema != verified factual data.
 */
export function historicalSignatureMatch(chart, columns, rows, goal="auto") {
  const nums=columns.filter(x=>x.type==="number");
  const cats=columns.filter(x=>x.type==="category");
  const dates=columns.filter(x=>x.type==="date");
  const names=columns.map(x=>x.name.toLowerCase());
  const named=re=>names.some(name=>re.test(name));
  const n=nums.length,c=cats.length,t=dates.length,count=rows.length;
  const positive=n>0 && nums.every(col=>col.nonnegative);
  const smallGroups=cats.some(col=>col.distinct>=2 && col.distinct<=12);
  const geo=columns.some(col=>col.geographic);
  const signatures = {
    ordered_time_measure: t>0 && n>0,
    ordered_time_magnitude: t>0 && n>0 && positive,
    ordered_time_additive_components: t>0 && n>=2 && positive,
    discrete_state_changes: t>0 && n>0 && named(/subsidy|halving|epoch|state|regime|event|tariff|status|tier/i),
    time_ohlc: t>0 && ["open","high","low","close"].every(x=>names.includes(x)),
    paired_endpoints: c>0 && n>=2,
    repeated_rankings: t>0 && c>0 && named(/rank|position|place/i),
    categorical_magnitudes: c>0 && n>0,
    categorical_cohorts: c>0 && n>=2,
    additive_components: c>0 && n>=2 && positive,
    normalized_composition: c>0 && n>=2 && positive,
    actual_target: c>0 && n>=2 && named(/target|goal|limit|capacity|threshold|utilization/i),
    reconcilable_changes: c>0 && n>0 && named(/delta|change|added|lost|gain|reduction|increase|decrease|variance/i),
    categorical_cause_counts: c>0 && n>0 && positive && named(/cause|reason|fault|failure|incident|error|defect|downtime/i),
    sensitivity_scenarios: c>0 && n>=2 && named(/scenario|low|high|base|sensitivity|best|worst/i),
    univariate_sample: n>0 && count>=8,
    grouped_samples: n>0 && c>0 && count>=12,
    dense_grouped_samples: n>0 && c>0 && count>=40,
    individual_observations: n>0 && count<=250,
    continuous_sample: n>0 && count>=20,
    paired_numeric: n>=2,
    paired_numeric_size: n>=3 && positive,
    matrix_values: c>=2 && n>0,
    dense_paired_numeric: n>=2 && count>=100,
    single_composition: c>0 && n>0 && smallGroups && positive,
    hierarchical_additive: c>=2 && n>0 && positive && named(/parent|child|category|subcategory|sector|segment|family|subsystem/i),
    conserved_flows: named(/^(source|from|origin|sender)$/i) && named(/^(target|to|destination|receiver)$/i) && n>0 && positive,
    sequential_cohort: c>0 && n>0 && positive && named(/stage|phase|funnel|pipeline|conversion|step/i),
    task_intervals: t>=2 && c>0 && named(/^(start|start date|begin|beginning|planned start)$/i) && named(/^(end|end date|finish|planned end|deadline)$/i),
    dated_daily_measure: t>0 && n>0 && count>=7,
    time_process_baseline: t>0 && n>0 && count>=12 && named(/control|process|ucl|lcl|sigma|quality|temperature|pressure|coolant/i),
    bounded_current_value: n>0 && named(/target|goal|limit|capacity|threshold|utilization/i),
    normalized_multivariate_profile: c>0 && n>=3 && positive && (named(/%|percent|fraction|ratio|score|normalized|share/i) || nums.every(x=>x.max<=1)),
    region_normalized_metric: geo && n>0,
    site_coordinates_magnitude: named(/^(latitude|lat)$/i) && named(/^(longitude|lon|lng)$/i) && n>=3
  };
  const signature=chart.historicalDataPattern || "undefined";
  const supported=Object.hasOwn(signatures,signature);
  let matches=supported && Boolean(signatures[signature]);
  const cautions=[];
  // Historical chart use is only suitable when the mathematical constraints hold.
  if(signature==="time_ohlc" && matches) {
    const val=field=>columns.find(x=>x.name.toLowerCase()===field)?.name;
    const number=v=>v===null||v===undefined||String(v).trim()===""?NaN:Number(String(v).replace(/[,$]/g,""));
    matches=rows.every(row=>{
      const [o,h,l,k]=["open","high","low","close"].map(s=>number(row[val(s)]));
      return [o,h,l,k].every(Number.isFinite) && h>=Math.max(o,l,k) && l<=Math.min(o,h,k);
    });
  }
  if(signature==="sequential_cohort" && matches)
    cautions.push("Stage names must describe the same cohort in order; test for attrition and changing denominators.");
  if(signature==="conserved_flows" && matches)
    cautions.push("Verify sums at every origin and destination and separately account for losses.");
  if(["ordered_time_additive_components","additive_components","normalized_composition"].includes(signature) && matches)
    cautions.push("Check that components are mutually exclusive, additive, and use common units.");
  if(signature==="region_normalized_metric" && matches &&
      !named(/per|rate|ratio|percent|%|density/i))
    cautions.push("Raw totals across differently sized regions are weak choropleth comparisons; calculate a justified rate.");
  if(signature==="normalized_multivariate_profile" && matches)
    cautions.push("Verify that every spoke has comparable direction and normalization.");
  if(signature==="time_process_baseline" && matches)
    cautions.push("Control limits require calculated statistical baselines, not operational target values.");
  if(signature==="site_coordinates_magnitude" && matches)
    cautions.push("Validate coordinates and make the symbol area proportional to magnitude.");
  if(signature==="reconcilable_changes" && matches)
    cautions.push("Confirm beginning balance + signed deltas = ending balance.");
  if(signature==="individual_observations" && rows.length>=100)
    cautions.push("Too many individual points can overlap; consider bins.");
  // A current editorial interpretation is a decision aid, not evidence of original historical usage.
  const bonus = !matches ? 0 :
    signature==="region_normalized_metric" && cautions.length ? 5 :
    ["time_ohlc","conserved_flows","site_coordinates_magnitude","task_intervals","repeated_rankings"].includes(signature) ? 25 : 17;
  const history=matches ? "Historical mathematical pattern matched: "+signature.replace(/_/g," ")+
    " — "+chart.textbook?.mathematics : 
    "Historical data relationship not established for "+signature.replace(/_/g," ")+".";
  const modern=chart.textbook?.modernInterpretation || chart.bestFor;
  return {
    eligible:matches,
    signature,bonus,history,modern,
    cautions,
    sourceCount:chart.textbook?.sources?.length||0,
    editorialGoal:goal
  };
}
