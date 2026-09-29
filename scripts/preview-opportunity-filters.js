// Local-only browser fixture server: never inserts test opportunities into the database.
const express = require('express');
const path = require('node:path');
const { browse } = require('../js/opportunity-filters');
const app = express();
const rows = [
  {id:'world',title:'Worldwide Robotics Challenge',category:'Competitions',host_country:'SG',eligibility_scope:'worldwide',eligible_countries:[],mode:'in_person',travel_required:true},
  {id:'sg',title:'Singapore Robotics Workshop',category:'Workshops',eligibility_scope:'countries',eligible_countries:['SG'],mode:'online',travel_required:false},
  {id:'multi',title:'Regional Art Challenge',category:'Competitions',host_country:'MY',eligibility_scope:'countries',eligible_countries:['MY','SG'],mode:'hybrid'},
  {id:'us',title:'US Robotics Workshop',category:'Workshops',eligibility_scope:'countries',eligible_countries:['US'],mode:'online'},
  {id:'unknown',title:'Unspecified Eligibility Example',category:'Volunteering',mode:'online'},
  ...Array.from({length:26},(_,i)=>({id:`extra-${i}`,title:`Sample Opportunity ${i+1}`,category:'Volunteering'})),
].map(row=>({...row,description:'Browser test fixture. Other entry requirements may apply.',application_deadline:'2027-12-31',application_url:'https://example.org/',application_method:'external'}));
app.get('/api/opportunities',(req,res)=>res.json(browse(rows,req.query)));
app.use(express.static(path.join(__dirname,'..')));
app.listen(3101,'127.0.0.1',()=>console.log('Local fixture preview: http://127.0.0.1:3101/pages/opportunities.html'));
