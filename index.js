//fs module
const express = require('express'); //callback & sync api
const app = express();
const path = require('path'); //callback & sync api
const fs = require('fs').promises; // Use promises for cleaner async/await 
const PORT = 3000;

app.set("view engine", "ejs"); //view-engine: convert code to server side, 2 types(ejs, pug)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //convert hexadecimal data(from server) to readable format
app.use(express.static(path.join(__dirname, "public")));
                                    //synchronous-first work, complete, then second work
app.get('/', async (req, res) => { //asnychronous-don't care, all work in parallel, automatically returns a promise
    try {
        const files = await fs.readdir('./files'); //await-wait for promise to resolve 
        res.render("index", { files }); //send HTML string to client, fulfilled value of promise is returned
    } catch (err) {
        res.status(500).send('Error reading files');
    }
});

app.get('/file/:filename', async (req, res) => { //use of ":" means variable filename
    try {
        const filedata = await fs.readFile(`./files/${req.params.filename}`, "utf-8");
        res.render('show', { filename: req.params.filename, filedata });
    } catch (err) {
        res.status(404).send('File not found');
    }
});

app.get('/edit/:filename', (req, res) => {
    res.render('edit', { filename: req.params.filename });
});

app.post('/edit', async (req, res) => {
    try {
        const previousFilePath = path.join(__dirname, 'files', req.body.previous);
        const newFilePath = path.join(__dirname, 'files', req.body.new);

        // Check if the previous file exists
        await fs.access(previousFilePath); // Throws an error if the file doesn't exist

        // Rename the file
        await fs.rename(previousFilePath, newFilePath);
        res.redirect("/");
    } catch (err) {
        console.error('Error renaming file:', err); // Log the error for debugging
        res.status(500).send('Error renaming file. Please ensure the file exists and the new name is valid.');
    }
});

app.post('/create', async (req, res) => {
    const title = req.body.title.split(' ').join('') + '.txt'; // Ensure filename is safe
    try {
        await fs.writeFile(`./files/${title}`, req.body.details);
        res.redirect("/");
    } catch (err) {
        res.status(500).send('Error creating file');
    }
});

// Delete Route
app.delete('/file/:filename', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'files', req.params.filename);
        await fs.unlink(filePath);
        res.status(204).send(); // No content
    } catch (err) {
        console.error('Error deleting file:', err); // Log the error
        res.status(404).send('File not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//app.listen(3000);
