import http from "k6/http";

export default function () {
  const response = http.get("http://localhost:8080/echo");

  const myVarMatch = /^[a-zA-Z]+/.exec(response.body);
  const myVar = myVarMatch && myVarMatch[0];

  console.log(myVar);
}
