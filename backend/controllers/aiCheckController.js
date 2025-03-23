const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const { spawn } = require("child_process");

const MONGO_URI = "mongodb+srv://cse22103:cb.en.u4@se.jdnaa.mongodb.net/studentPortal?retryWrites=true&w=majority&appName=se";
const DB_NAME = "studentPortal";
const COLLECTION_NAME = "submissions";
const RESULTS_COLLECTION = "plagiarism_results";
const DOWNLOADS_DIR = path.join("C:", "Users", "dvpry", "Downloads", "Content");

if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

exports.downloadFiles = async (req, res) => {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const database = client.db(DB_NAME);
        const collection = database.collection(COLLECTION_NAME);
        const students = database.collection("students");
        
        const documents = await collection.find().toArray();
        if (documents.length === 0) return res.json({ message: "No documents found." });

        let downloadedFiles = 0;
        const sanitizeFilename = (name) => name.replace(/[<>:"/\\|?*]+/g, "_");

        for (const doc of documents) {
            if (doc.document && doc.document.buffer) {
                try {
                    const studentID = new ObjectId(doc.studentID);
                    const student = await students.findOne({ _id: studentID });
                    if (!student || !student.name) continue;

                    const sanitizedStudentName = sanitizeFilename(student.name);
                    const filePath = path.join(DOWNLOADS_DIR, `${sanitizedStudentName}.docx`);
                    fs.writeFileSync(filePath, doc.document.buffer);
                    downloadedFiles++;
                } catch (fileError) {
                    console.error("File save error:", fileError);
                }
            }
        }

        res.json({ message: `${downloadedFiles} files downloaded successfully!` });
    } catch (error) {
        res.status(500).json({ error: "Failed to download files." });
    } finally {
        await client.close();
    }
};

exports.runAI = async (req, res) => {
    const pythonProcess = spawn("python", ["./scripts/AIchecker.py"]);
    let resultData = "";

    pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`AI Model Error: ${data}`);
    });

    pythonProcess.on("close", async () => {
        try {
            const parsedData = JSON.parse(resultData);
            if (!parsedData.documents || !Array.isArray(parsedData.documents)) {
                throw new Error("Invalid AI response format");
            }

            const client = new MongoClient(MONGO_URI);
            await client.connect();
            const db = client.db(DB_NAME);
            const collection = db.collection(RESULTS_COLLECTION);

            const records = parsedData.documents.map(doc => ({
                filename: doc.File,
                perplexity: doc.Results.Perplexity,
                burstiness: doc.Results.Burstiness,
                ai_plagiarism_score: doc.Output.AI_Plagiarism_Score || null,
                label: doc.Output.label,
                message: doc.Output.message
            }));

            await collection.insertMany(records);
            res.json({ message: "AI processing complete and results stored!", results: records });
        } catch (error) {
            res.status(500).json({ error: "AI Processing Error" });
        }
    });
};
