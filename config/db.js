var mongoose    =   require("mongoose");
//var url ='mongodb://localhost:27017/db_rest_api';
const connUri = process.env.MONGO_LOCAL_CONN_URL+process.env.MONGO_DB_NAME;
mongoose.set('useCreateIndex', true)
mongoose.connect(connUri, { useNewUrlParser: true , useUnifiedTopology: true });
mongoose.connection.once('open',console.error.bind(console,'database connected'))