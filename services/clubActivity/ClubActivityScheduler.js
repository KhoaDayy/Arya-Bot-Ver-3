const cron = require('node-cron');

/**
 * Scheduler tự động fetch club activity mỗi tuần.
 * Chạy vào Thứ 2 lúc 03:55 (trước game reset 04:00) để lấy data tuần hoàn chỉnh.
 */
class ClubActivityScheduler {
    /**
     * @param {import('./ClubActivityService').ClubActivityService} service
     */
    constructor(service) {
        this.service = service;
    }

    start() {
        console.log('🕒 Starting ClubActivity Cron Job (Mon 03:55 VN)...');
        // Cron: phút 55, giờ 3, ngày *, tháng *, thứ 1 (Monday)
        cron.schedule('55 3 * * 1', async () => {
            console.log('[ClubActivity] ⏰ Weekly auto-fetch triggered...');
            try {
                const result = await this.service.fetchAll();
                console.log(`[ClubActivity] 📊 Done: ${result.success}/${result.total} success, ${result.failed} failed.`);
            } catch (err) {
                console.error('[ClubActivity] Cron error:', err);
            }
        }, {
            timezone: 'Asia/Ho_Chi_Minh',
        });
    }
}

module.exports = { ClubActivityScheduler };
