const generateSQL = async (schema, question) => {
  const response = await fetch(process.env.API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "defog/llama-3-sqlcoder-8b:featherless-ai",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates SQL queries based on the schema and question. Only return SQL."
        },
        {
          role: "user",
          content: `Schema:
                CREATE TABLE users (id INT, name VARCHAR(100), email VARCHAR(255));
                CREATE TABLE orders (order_id INT, user_id INT, amount INT);

                Request: Get all users
                SQL: SELECT * FROM users;

                Schema:
                CREATE TABLE users (id INT, name VARCHAR(100), email VARCHAR(255));
                CREATE TABLE orders (order_id INT, user_id INT, amount INT);

                Request: Get all orders above 100
                SQL: SELECT * FROM orders WHERE amount > 100;

                Schema:
                ${schema}
                Request:
                ${question}`
        }
      ]
    }),
  });

  const data = await response.json();
  const sql = data?.choices?.[0]?.message?.content || data?.generated_text || data?.sql || "No SQL generated.";
  return sql;
};

module.exports = { generateSQL };
