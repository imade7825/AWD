function greet(name: string) {
  console.log(`Hello, ${name.toUpperCase()}!`);
}
greet("Bootcamp Attendee");

import * as _ from "lodash";
const groups = _.groupBy(["one", "two", "three"], "length");
