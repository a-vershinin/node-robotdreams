// Utils
import { sum, delay } from "./utils";

main();

function main() {
  console.log("🚀 node-robotdreams app ready");

  console.log("sum(10, 20) -> ", sum(10, 20));

  delay(2000).then(() => console.log("Прошло 2 секунди"));
}
