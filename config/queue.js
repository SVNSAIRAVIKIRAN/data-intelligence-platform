const Queue = require('bull');
const logger = require('./logger');

// Create Redis queues
const emailQueue = new Queue('email-queue', {
    redis: {
        host: 'localhost',
        port: 6379
    }
});

const reportQueue = new Queue('report-queue', {
    redis: {
        host: 'localhost',
        port: 6379
    }
});

// Process email queue
emailQueue.process(async (job) => {
    try {
        const { to, subject, content } = job.data;
        logger.info(`Processing email to ${to}`);
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info(`Email sent to ${to}`);
    } catch (error) {
        logger.error('Error processing email:', error);
        throw error;
    }
});

// Process report queue
reportQueue.process(async (job) => {
    try {
        const { userId, reportType } = job.data;
        logger.info(`Generating ${reportType} report for user ${userId}`);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 5000));
        logger.info(`Report generated for user ${userId}`);
        return { completed: true, timestamp: new Date() };
    } catch (error) {
        logger.error('Error generating report:', error);
        throw error;
    }
});

module.exports = {
    emailQueue,
    reportQueue
};