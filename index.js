const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises; // Use promises for cleaner async/await
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', async (req, res) => {
    try {
        const files = await fs.readdir('./files');
        res.render("index", { files });
    } catch (err) {
        res.status(500).send('Error reading files');
    }
});

app.get('/file/:filename', async (req, res) => {
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
