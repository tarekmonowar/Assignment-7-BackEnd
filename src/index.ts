import app from "./app.js"; // Ensure this import is correct
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
