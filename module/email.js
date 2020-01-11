const nodemailer = require('nodemailer');
const logger = require('./logger');
const fs = require('fs');
let transporter = require('./sensitiveConfig').transporter;


// 发送登录成功的邮件通知
exports.sendMailSuccessLogin = function (email, grades) {
	logger.log('登录成功通知，发送邮件：', email, ' 成绩：', grades.finalGrade);
	let mailOptions = {
		from: `"[麦芽糖]成绩通知系统" `, // sender address
		to: email, // list of receivers
		subject: '【登录成功】你已成功登录成绩通知系统', // Subject line
		html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1><h2>当有新成绩时，我会第一时间通知你哒</h2><p>最新成绩为：</p><p>${grades.className}</p><p>最终成绩：<b>${grades.finalGrade}</b></p><p>期末成绩：<b>${grades.paperGrade}</b></p><p>平时成绩：<b>${grades.regularGrade}</b></p>
        验证码：${Math.ceil(Math.random() * 9000 + 1000)} 这个验证码是为了反垃圾邮件的，并没有什么用`
		// <p>如有疑问或建议，欢迎加群：<b>821850193</b>来讨论</p>
		// <p>如需退订/重新订阅服务或修改邮箱，请访问<a href="http://vin94.cn/grade-setting" target="_blank" rel="noopener noreferrer">vin94.cn/grade-setting</a></p>` // html body
	};

	// send mail with defined transport object
	toSendEmail(email, mailOptions);

}

// 发送登录成功但未完成课程评价的邮件通知
exports.sendMailSuccessLoginWithoutComment = function (email) {
	logger.log('登录成功但未完成课程评价，发送邮件：', email);
	let mailOptions = {
		from: `"[麦芽糖]成绩通知系统" `, // sender address
		to: email, // list of receivers
		subject: '【登录成功】你已成功登录成绩通知系统', // Subject line
		html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1><h2>当有新成绩时，我会第一时间通知你哒</h2><h2>你还没有完成课程评价，我无法查询你的成绩哦</h2>
        验证码：${Math.ceil(Math.random() * 10000)} 这个验证码是为了反垃圾邮件的，并没有什么用`
		// <p>如有疑问或建议，欢迎加群：<b>821850193</b>来讨论</p>
		// <p>如需退订/重新订阅服务或修改邮箱，请访问<a href="http://vin94.cn/grade-setting" target="_blank" rel="noopener noreferrer">vin94.cn/grade-setting</a></p>` // html body
	};

	// send mail with defined transport object
	toSendEmail(email, mailOptions);

}

//新成绩时,发送邮件
/**
 * @param{mode} 邮件标题模式，为0表示标题展示成绩，为1表示展示科目
 */
exports.sendMailNewGrade = function (email, grades, mode) {
	logger.log('新成绩通知，发送邮件：', email, ' 成绩：', grades.finalGrade);
	let emailTitle = `[n-e-w grades]${grades.finalGrade}分 ${grades.className}`;
	let mailOptions = null;
	/**
	 * 
	 */
	if (/职场|英语|学术|视听说|高级|营销|文化|养生|饮食|合作|优惠|共享|折扣|商务|酒店|税务|采购|家电|广告|代理|成交|销售|租赁|金融|经济|额度|信用|发票|开票|公司|我司|推出/ig.test(grades.className)) {
		emailTitle = `[You have [n-e-w] grades]${grades.finalGrade}`;
		grades.className = 'I cannot display your subject name beacuse of the spam system. Please log in to the Dean to check.'
		mailOptions = {
			from: `"[Vincent] GPA" `, // sender address
			to: email, // list of receivers
			subject: emailTitle, // Subject line
			html: `<h1>Welcome to Vincent's email notification system</h1><h2>Tomorrow and grades, you never know which comes first.</h2><h2>抱歉，这封邮件可能迟到了数小时，因为我写的bug导致系统挂了</h2><p>subject:</p><p>${grades.className}</p><p>final grades:<b>${grades.finalGrade}</b></p><p>paper grades：<b>${grades.paperGrade}</b></p><p>regular grades:<b>${grades.regularGrade}</b></p>`
			//验证码：${Math.ceil(Math.random() * 10000)} 这个验证码是为了反垃圾邮件的，并没有什么用`
		};
	} else {
		mailOptions = {
			from: `"[麦芽糖]成绩通知系统" `, // sender address
			to: email, // list of receivers
			subject: emailTitle, // Subject line
			// subject: `${grades.finalGrade}分`,
			//<h2>明天和成绩，你永远不知道哪一个先来。</h2>
			// html: ``
			html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1>
			<h2>抱歉，这封邮件可能迟到了数小时，因为我写的bug导致系统挂了</h2>
			<p>最新成绩为：</p><p>${grades.className}</p><p>最终成绩：<b>${grades.finalGrade}</b></p><p>期末成绩：<b>${grades.paperGrade}</b></p><p>平时成绩：<b>${grades.regularGrade}</b></p>
			      验证码：${Math.ceil(Math.random() * 10000)} 这个验证码是为了反垃圾邮件的，并没有什么用`
			// html: `<h1>非常抱歉，今天这边出现了一些状况，导致今天的通知出现了数小时的延迟</h1><h2>明天和成绩，你永远不知道哪一个先来。</h2><p>最新成绩为：</p><p>${grades.className}</p><p>最终成绩：<b>${grades.finalGrade}</b></p><p>期末成绩：<b>${grades.paperGrade}</b></p><p>平时成绩：<b>${grades.regularGrade}</b></p>
			//       验证码：${Math.ceil(Math.random() * 10000)} 这个验证码是为了反垃圾邮件的，并没有什么用`
		};
	}

	// 备用的选项
	let backupMailOptions = {
		from: `"[Vincent] GPA" `, // sender address
		to: email, // list of receivers
		subject: `[You have [n.e.w] grades]${grades.finalGrade}`, // Subject line
		html: `<h1>Welcome to Vincent's GPA notification system</h1><h2>抱歉，这封邮件可能迟到了数小时，因为我写的bug导致系统挂了</h2><h2>Tomorrow and grades, you never know which comes first.</h2><p>subject:</p><p>${grades.className}</p><p>final grades:<b>${grades.finalGrade}</b></p><p>paper grades：<b>${grades.paperGrade}</b></p><p>regular grades:<b>${grades.regularGrade}</b></p>`
	};

	if (mode == 1) {
		emailTitle = `【新成绩】你有新的成绩：${grades.className}`;
	} else if (mode == 2) {
		emailTitle = `【新成绩】你有新的成绩`;
	}

	console.log(mailOptions.html);

	// send mail with defined transport object
	toSendEmail(email, mailOptions, backupMailOptions)
		.catch(err => {
			try {
				// 发送邮件失败
				fs.readFile('./failedEmail.json', 'utf8', (err, data) => {
					if (err) {
						console.log(`备份邮件失败：failedEmail.json文件读取失败`);
						return;
					}
					let emailBackup = {
						email: email,
						grades: grades
					}
					data = JSON.parse(data);
					if (data instanceof Array) {
						data.push(emailBackup);
						fs.writeFile('./failedEmail.json', JSON.stringify(data), (err) => { if (err) console.log(err); });
					}
				})
			} catch (error) {
				console.log(error);
			}

		})
		.catch(err => {
			console.log(err);
		})

}

// 账号被删除时，发送通知邮件
exports.sendMailDeleteUser = (email) => {
	logger.log('删除账号通知，发送邮件：', email);
	let mailOptions = {
		from: `"[麦芽糖]成绩通知系统" `, // sender address
		to: email, // list of receivers
		subject: `【麦芽糖】你的账号因密码不正确而被删除`, // Subject line
		html: `<h1>欢迎来到麦芽糖的邮件通知系统</h1>
        <h2>你的账号已从本系统中清除</h2>
        <p>如需继续使用，请重新录入</p>
        验证码：${Math.ceil(Math.random() * 10000)} 这个验证码是为了反垃圾邮件的，并没有什么用`
		// <p>如需继续使用，请在<a href="http://vin94.cn/grades" target="_blank" rel="noopener noreferrer">vin94.cn/grades</a>重新录入</p>
		// <p>如有疑问或建议，欢迎加群：<b>821850193</b>来讨论</p>
		// <p>如需退订/重新订阅服务或修改邮箱，请访问<a href="http://vin94.cn/grade-setting" target="_blank" rel="noopener noreferrer">vin94.cn/grade-setting</a></p>` // html body
	};
	toSendEmail(email, mailOptions);
}

/**
 * 发送邮件
 */
function toSendEmail(email, mailOptions, backupMailOptions) {
	return new Promise((resolve, reject) => {
		let from = '[麦芽糖]成绩通知系统" ';
		mailOptions.from = from + transporter.ne126Email;//发信者的地址
		transporter.ne126.sendMail(mailOptions, (error, info) => {
			if (error) {
				logger.logErr('ne发送邮件失败:', email);
				logger.log('ne发送邮件失败:', email);
				logger.logErr(error);
				console.log(error);
				// 126发信失败，改用腾讯企业邮箱发送
				if (backupMailOptions)
					mailOptions = backupMailOptions;// 切换成英文版
				mailOptions.from = from + transporter.txEnterEmail;
				transporter.txEnter.sendMail(mailOptions, (error, info) => {
					if (error) {
						logger.logErr('tx发送邮件失败:', email);
						logger.log('tx发送邮件失败:', email);
						logger.logErr(error);
						console.log(error);
						reject(error);
					} else {
						console.log('发送邮件: %s', info.messageId);
						resolve;
					}
				})
			}
			else {
				console.log('发送邮件: %s', info.messageId);
				resolve();
			}
			// Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
		});
	})


}

function failedEmailBackup() {

}