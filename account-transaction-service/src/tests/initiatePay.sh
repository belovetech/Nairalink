userId=20a79d15-d9b3-4d12-98f2-0224b40ad856

curl -d @pay.json -H "Content-Type: application/json" -X POST http://localhost:3000/api/v1//transactions/$userId/fund
