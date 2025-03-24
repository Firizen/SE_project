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
        const submissions = database.collection(COLLECTION_NAME);
        const results = database.collection(RESULTS_COLLECTION);
        const students = database.collection("students");

        // Get all submission IDs that already exist in plagiarism_results
        const existingResults = await results.find({}, { projection: { submissionID: 1 } }).toArray();
        const existingSubmissionIDs = new Set(existingResults.map(result => result.submissionID.toString()));

        const documents = await submissions.find().toArray();
        if (documents.length === 0) return res.json({ message: "No documents found." });

        let downloadedFiles = 0;
        const sanitizeFilename = (name) => name.replace(/[<>:"/\\|?*]+/g, "_");

        for (const doc of documents) {
            if (doc.document && doc.document.buffer) {
                if (existingSubmissionIDs.has(doc._id.toString())) {
                    console.log(`Skipping submission ${doc._id} as it's already processed.`);
                    continue;
                }

                try {
                    const student = await students.findOne({ _id: new ObjectId(doc.studentID) });
                    if (!student || !student.name) continue;

                    const sanitizedStudentName = sanitizeFilename(student.name);
                    const filePath = path.join(DOWNLOADS_DIR, `${doc._id}_${sanitizedStudentName}.docx`); // Include submission ID in filename
                    fs.writeFileSync(filePath, doc.document.buffer);
                    downloadedFiles++;
                } catch (fileError) {
                    console.error("File save error:", fileError);
                }
            }
        }

        res.json({ message: `${downloadedFiles} files downloaded successfully!` });
    } catch (error) {
        console.error("Download Error:", error);
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
            console.log("Raw AI Output:", resultData); // Debugging: Check AI Output

            const parsedData = JSON.parse(resultData);
            if (!parsedData.documents || !Array.isArray(parsedData.documents)) {
                throw new Error("Invalid AI response format");
            }

            const client = new MongoClient(MONGO_URI);
            await client.connect();
            const db = client.db(DB_NAME);
            const collection = db.collection(RESULTS_COLLECTION);

            const records = parsedData.documents.map(doc => {
                // Extract submissionID from filename (assumes filename format: "submissionID_studentName.docx")
                const fileNameParts = doc.File.split("_");
                const submissionID = fileNameParts[0]; // Get submissionID from filename

                if (!ObjectId.isValid(submissionID)) {
                    console.error(`Invalid submissionID extracted: ${submissionID}`);
                    return null;
                }

                return {
                    submissionID: new ObjectId(submissionID), // Use correct submission ID
                    filename: doc.File,
                    perplexity: doc.Results?.Perplexity ?? null,
                    burstiness: doc.Results?.Burstiness ?? null,
                    ai_plagiarism_score: doc.Output?.AI_Plagiarism_Score ?? doc.Results?.["AI Score"] ?? null,
                    label: doc.Output?.label ?? doc.Results?.Label ?? "Unknown",
                    message: doc.Output?.message ?? doc.Results?.Message ?? "No message provided",
                    createdAt: new Date()
                };
            }).filter(record => record !== null); // Remove null values

            if (records.length > 0) {
                await collection.insertMany(records);
                res.json({ message: "AI processing complete and results stored!", results: records });
            } else {
                res.status(400).json({ error: "No valid AI results to store." });
            }
        } catch (error) {
            console.error("AI Processing Error:", error);
            res.status(500).json({ error: "AI Processing Error" });
        }
    });
};
