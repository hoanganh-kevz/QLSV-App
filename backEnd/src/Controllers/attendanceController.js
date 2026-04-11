const Attendance = require('../models/Attendance');
const ClassSection = require('../models/ClassSection');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @desc    Mark attendance for multiple students
// @route   POST /api/attendances/batch
// @access  Private (Admin, Teacher)
exports.batchMark = async (req, res) => {
  try {
    const { classSectionId, date, records } = req.body; // records: [{ studentId, status, note }]

    if (!classSectionId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    const classSection = await ClassSection.findById(classSectionId);
    if (!classSection) return res.status(404).json({ message: 'Class section not found' });

    // Ownership check for teachers
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (!teacher || classSection.teacher.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to mark attendance for this class' });
      }
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const ops = records.map(rec => ({
      updateOne: {
        filter: { student: rec.studentId, classSection: classSectionId, date: attendanceDate },
        update: { 
          status: rec.status, 
          note: rec.note, 
          markedBy: req.user._id 
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);

    // Sync to Grade Model
    const Grade = require('../models/Grade');
    const classSectionSync = await ClassSection.findById(classSectionId).populate('subject');
    const totalSessions = (classSectionSync.subject?.credits || 3) * 3;
    const latePenalty = classSectionSync.attendanceRules?.latePenalty || 0;

    const studentIds = records.map(r => r.studentId);
    
    // Find all attendance records for these students in this class
    const allAttendance = await Attendance.find({
      classSection: classSectionId,
      student: { $in: studentIds }
    });

    for (const studentId of studentIds) {
      const studentAtts = allAttendance.filter(a => a.student.toString() === studentId.toString());
      let absentCount = 0;
      let lateCount = 0;

      for (const att of studentAtts) {
        if (att.status === 'Absent') absentCount++;
        else if (att.status === 'Late') lateCount++;
      }

      const totalPenalty = absentCount + (lateCount * latePenalty);
      const isExamBanned = (totalPenalty / totalSessions) > 0.3;
      const attendanceScore = Math.max(0, ((totalSessions - totalPenalty) / totalSessions) * 10);
      
      const grade = await Grade.findOne({ studentId, classSection: classSectionId });
      
      const schemaAtt = classSectionSync.gradingSchema?.find(s => s.type === 'attendance');
      const attName = schemaAtt ? schemaAtt.name : 'Chuyên cần';
      const attWeight = schemaAtt ? schemaAtt.weight : 20;

      if (grade) {
         grade.isExamBanned = isExamBanned;
         const attIndex = grade.components.findIndex(c => c.type === 'attendance');
         if (attIndex !== -1) {
            grade.components[attIndex].score = attendanceScore;
         } else {
            grade.components.push({ name: attName, score: attendanceScore, weight: attWeight, type: 'attendance' });
         }
         await grade.save(); 
      } else {
         const student = await Student.findById(studentId);
         if (student) {
             const newGrade = new Grade({
                 studentId: student._id,
                 studentMssv: student.mssv,
                 studentName: student.fullName,
                 subject: classSectionSync.subject._id,
                 subjectCode: classSectionSync.subject.code,
                 subjectName: classSectionSync.subject.name,
                 classSection: classSectionSync._id,
                 classStr: classSectionSync.code,
                 term: classSectionSync.term,
                 semester: 'N/A', 
                 isExamBanned: isExamBanned,
                 components: [{ name: attName, score: attendanceScore, weight: attWeight, type: 'attendance' }]
             });
             await newGrade.save();
         }
      }
    }

    res.status(200).json({ success: true, message: 'Attendance updated and synced to grades successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get attendance history for the logged-in student
// @route   GET /api/attendances/my-history
// @access  Private (Student)
exports.getStudentHistory = async (req, res) => {
  try {
    // Current user is a user, we need to find their Student profile
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ student: student._id })
      .populate('classSection', 'code')
      .populate({
          path: 'classSection',
          populate: { path: 'subject', select: 'name code' }
      })
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get attendance for a class section on a specific date
// @route   GET /api/attendances/class/:classSectionId
// @access  Private (Admin, Teacher)
exports.getClassRecords = async (req, res) => {
  try {
    const { classSectionId } = req.params;
    const { date } = req.query;

    const classSection = await ClassSection.findById(classSectionId);
    if (!classSection) return res.status(404).json({ message: 'Class section not found' });

    // Ownership check for teachers
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (!teacher || classSection.teacher.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view attendance for this class' });
      }
    }

    const query = { classSection: classSectionId };
    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      query.date = attendanceDate;
    }

    const records = await Attendance.find(query).populate('student', 'mssv fullName');

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
