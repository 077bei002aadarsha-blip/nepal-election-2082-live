require('ts-node/register');
(async()=>{
  const { fetchElectionResults } = require('../src/lib/ecn-parser');
  const data = await fetchElectionResults();
  const others=new Set();
  data.provinces.forEach(p=>p.districts.forEach(d=>d.constituencies.forEach(c=>{
    c.candidates.forEach(v=>{
      if(v.party==='other') others.add(v.nameEn||v.name);
    });
  })));
  console.log('other names', Array.from(others));
})();
