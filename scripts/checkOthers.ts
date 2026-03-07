import { fetchElectionResults } from '../src/lib/ecn-parser';
(async()=>{
  const data = await fetchElectionResults();
  const others=new Set<string>();
  data.provinces.forEach(p=>p.districts.forEach(d=>d.constituencies.forEach(c=>{
    c.candidates.forEach(v=>{
      if(v.party==='other') others.add(v.nameEn||v.name);
    });
  })));
  console.log('other names', Array.from(others));
})();
