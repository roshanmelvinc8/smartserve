const sendWhatsapp = (studentName, tokenNumber, status) => {
  // Simulated WhatsApp — printed to console
  console.log(`WhatsApp sent to ${studentName}: Your token ${tokenNumber} is now ${status}`);
};

module.exports = { sendWhatsapp };
