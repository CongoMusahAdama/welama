const mongoose = require('mongoose');

/**
 * Runs work inside a MongoDB multi-document transaction.
 * Atlas replica sets support snapshot isolation + majority durability.
 */
const withTransaction = async (work) => {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(
            async () => {
                result = await work(session);
            },
            {
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority', j: true },
                readPreference: 'primary'
            }
        );
        return result;
    } finally {
        await session.endSession();
    }
};

const isDuplicateKey = (error) => error?.code === 11000;

module.exports = { withTransaction, isDuplicateKey };
