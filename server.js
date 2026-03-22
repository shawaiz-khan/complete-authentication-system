import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from './src/config/mongo.js';

connectDB();

app.listen(config.PORT, () => {
    console.log(`App is Listening to port ${config.PORT}`);
});