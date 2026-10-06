export const toolkitLayers = [
  {name:'Frontend',color:0xc4ff80,primary:'react'},
  {name:'Backend',color:0x84e5c1,primary:'laravel'},
  {name:'Data',color:0x9dbbff,primary:'postgresql'},
  {name:'Tools',color:0xc6a5ff,primary:'wordpress'}
];

export const technologies = [
  {id:'react',name:'React',icon:'react',layer:0,title:'Teacher workflows, built as a product.',description:'DevTrack brings lessons, attendance and assessment into a React teacher workspace.',href:'#project-devtrack',link:'See DevTrack'},
  {id:'nextjs',name:'Next.js',icon:'nextdotjs',layer:0,title:'One workspace for the school day.',description:'Next.js powers the DevTrack interface, connecting school workflows to its data and timetable integrations.',href:'#project-devtrack',link:'See DevTrack'},
  {id:'typescript',name:'TypeScript',icon:'typescript',layer:0,title:'Answers that tolerate a typo.',description:'The Songs matcher normalises Latvian text and uses a bounded edit distance to evaluate player answers.',href:'#source-songs',link:'Inspect the matcher'},
  {id:'laravel',name:'Laravel',icon:'laravel',layer:1,title:'Domain rules behind an API.',description:'TV Guide checks programme intervals and models a broadcast day that starts at 06:00.',href:'#source-lsm',link:'Inspect the service'},
  {id:'php',name:'PHP',icon:'php',layer:1,title:'A check-in becomes classroom state.',description:'Deskplan records seat sessions, updates the classroom version and returns the new state through its Laravel API.',href:'#source-deskplan',link:'Inspect check-in code'},
  {id:'postgresql',name:'PostgreSQL',icon:'postgresql',layer:2,title:'Sales become ledger entries.',description:'Tagorit stores sale and team-override commissions separately, with conflict handling for repeated inserts.',href:'#source-tagorit',link:'Inspect the ledger'},
  {id:'mysql',name:'MySQL',icon:'mysql',layer:2,title:'Model the classroom, then its history.',description:'Deskplan separates schools, classrooms, desks, lesson periods and seat sessions in its data model.',href:'#project-deskplan',link:'See Deskplan'},
  {id:'wordpress',name:'WordPress',icon:'wordpress',layer:3,title:'E-commerce shaped by real constraints.',description:'Vinnis.lv uses WooCommerce with custom delivery rules for products, parcel weights and carrier limits.',href:'#project-vinnis',link:'See Vinnis.lv'},
  {id:'docker',name:'Docker',icon:'docker',layer:3,title:'A local environment for a backend project.',description:'The TV Guide API uses Docker and Laravel Sail alongside its Laravel and MySQL stack.',href:'#project-lsm',link:'See TV Guide API'},
  {id:'git',name:'Git',icon:'git',layer:3,title:'The source is part of the portfolio.',description:'Explore the repositories behind DevTrack, Tagorit, Deskplan, TV Guide and Songs. Code examples link to specific source revisions.',href:'https://github.com/krievinsss',link:'Explore GitHub'}
];

export function getTechnology(id){return technologies.find(tech=>tech.id===id);}
export function visibleTechnologies(layer,expanded=false){return technologies.filter(tech=>expanded||tech.layer===layer||toolkitLayers[tech.layer].primary===tech.id);}
