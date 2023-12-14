import { group } from "k6";

export default function () {
  group("first", () => {});

  group("second", () => {});
}
