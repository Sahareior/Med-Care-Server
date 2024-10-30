const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// kY5UJHr2VyuvUI9I medCare

const uri = "mongodb+srv://medCare:kY5UJHr2VyuvUI9I@cluster0.j0rll9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const uri = "mongodb://localhost:27017/";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function startServer() {
  try {
     client.connect();
    console.log("Connected to MongoDB");

    const db = client.db('DoctorAppoinment');
    const doctorList = db.collection("doctorList")
    const appointmentList = db.collection("appointment")
    // Add your routes or other logic here
    app.get('/doctors', async(req,res)=>{
        try{
            const result = await doctorList.find().toArray()
            res.send(result)
        }
        catch(error){
            res.send(error)
        }
    })

    app.post('/appointment', async(req,res)=>{
        const data = req.body;
        const date = new Date()
        const localTime = date.toLocaleTimeString(); // Local time
        const localDate = date.toLocaleDateString(); // Local date
        const createdAt = {
            time: localTime,
            date:localDate
        }
        console.log(localTime,localDate)
        const {doctorId,name,phone,address,selectedDate,image,selectedTime,email,doctorName,doctorSpeciality} = data;
        const result = await appointmentList.insertOne({
            doctorId,name,phone,address,selectedDate,image,selectedTime,email,doctorName,doctorSpeciality,createdAt
        })
        console.log(result)
        res.send(result)
    })

    app.post('/doctors', async(req,res)=>{
        const data = req.body
        const newData = {...data,rating:4.4}
        console.log(newData)
        try{
            const result = await doctorList.insertOne(data)
            console.log(result)
            res.send(result)
        }
        catch(err){
            res.send(err)
        }
    })

    app.get('/appointment/:email', async (req, res) => {
        const email = req.params.email;
        console.log('Received email:', email);
    
        try {
            // Find all appointments by email
            const appointments = await appointmentList.find({ email }).toArray();
    
            // Collect doctors' details for each appointment
            const docDetails = [];
            
            for (let i = 0; i < appointments.length; i++) {
                const doctorId = appointments[i].doctorId;
                console.log(doctorId)
    
                // Retrieve doctor details for each doctorId
                const doctorDetail = await doctorList.findOne({ _id: new ObjectId(doctorId) });
                console.log(doctorDetail)
                if (doctorDetail) {
                    docDetails.push(doctorDetail);
                }
            }
    
            if (appointments.length > 0) {
                
                // Send both appointments and doctor details in response
                res.status(200).json({ appointments });
            } else {
                console.log('No appointments found for this email');
                res.status(404).json({ message: 'No appointments found for this email' });
            }
        } catch (error) {
            console.error('Error querying database:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    
    
    

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

// Call startServer and handle any errors
startServer().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  

// Start the Express server with `app.listen` instead of `server.listen`
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
