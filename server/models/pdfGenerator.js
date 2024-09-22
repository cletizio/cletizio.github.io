// pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateCertificate(user, testDetails, outputFilePath) {
    const doc = new PDFDocument();

    // Save the PDF to a file
    doc.pipe(fs.createWriteStream(outputFilePath));

    // Customize your PDF content
    doc.fontSize(25).text('Certification of Completion', { align: 'center' });

    doc.moveDown();
    doc.fontSize(18).text(`This is to certify that ${user.name}`, { align: 'center' });
    doc.text(`has successfully completed the test: ${testDetails.name}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Score: ${testDetails.score} / ${testDetails.totalScore}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    // Finalize the PDF
    doc.end();
}

module.exports = generateCertificate;
