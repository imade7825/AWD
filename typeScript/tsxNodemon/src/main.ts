interface SuperheroData {
  superheroes: string[];
}

import marvelData from "./superheroes.json";

function logSuperheroCount(data: SuperheroData): void {
  const count = data.superheroes.length;

  console.log(`--- Marvel Data Summary ---`);
  console.log(`Total Superheroes Found: ${count}`);
  console.log(`---------------------------`);
  console.log("test tsx")
  
}

logSuperheroCount(marvelData);