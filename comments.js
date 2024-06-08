const express = require('express');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");

const serviceAccount = require('./firebaseConfig.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://flavor-finder-capstone.firebaseio.com"
});

const db = admin.firestore();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint untuk menambahkan komentar
app.post('/comments', (req, res) => {
    const { text } = req.body; // Dapatkan teks komentar dari body request
    // Simpan komentar ke Firestore
    db.collection('comments').add({
        text: text,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
    .then(docRef => {
        res.status(201).send("Komentar berhasil ditambahkan");
    })
    .catch(error => {
        console.error("Error menambahkan komentar: ", error);
        res.status(500).send("Terjadi kesalahan saat menambahkan komentar");
    });
});

// Endpoint untuk mendapatkan semua komentar
app.get('/comments', (req, res) => {
    // Ambil semua komentar dari Firestore
    db.collection('comments').get()
    .then(snapshot => {
        let comments = [];
        snapshot.forEach(doc => {
            comments.push(doc.data());
        });
        res.json(comments);
    })
    .catch(error => {
        console.error("Error mengambil komentar: ", error);
        res.status(500).send("Terjadi kesalahan saat mengambil komentar");
    });
});

// Endpoint untuk menghapus komentar berdasarkan ID
app.delete('/comments/:commentId', (req, res) => {
    const commentId = req.params.commentId; // Dapatkan ID komentar dari URL
    // Hapus komentar dari Firestore berdasarkan ID
    db.collection('comments').doc(commentId).delete()
    .then(() => {
        res.send("Komentar berhasil dihapus");
    })
    .catch(error => {
        console.error("Error menghapus komentar: ", error);
        res.status(500).send("Terjadi kesalahan saat menghapus komentar");
    });
});

// Endpoint untuk memperbarui komentar berdasarkan ID
app.put('/comments/:commentId', (req, res) => {
    const commentId = req.params.commentId; // Dapatkan ID komentar dari URL
    const { text } = req.body; // Dapatkan teks komentar yang diperbarui dari body request
    // Perbarui komentar di Firestore berdasarkan ID
    db.collection('comments').doc(commentId).update({
        text: text
    })
    .then(() => {
        res.send("Komentar berhasil diperbarui");
    })
    .catch(error => {
        console.error("Error memperbarui komentar: ", error);
        res.status(500).send("Terjadi kesalahan saat memperbarui komentar");
    });
});

// Port untuk server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
