import http from "k6/http";

export default function () {
  const response = http.get("http://localhost:8080");

  const myVar1 = response.body;
  const myVar2 = response.body;
  const myVar3 = response.body;
}
