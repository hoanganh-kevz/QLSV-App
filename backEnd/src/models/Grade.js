const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student is required'],
        },
        studentMssv: {
            type: String,
            required: [true, 'Student MSSV is required'],
            trim: true,
        },
        studentName: {
            type: String,
            trim: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
        },
        subjectCode: {
            type: String,
            trim: true,
        },
        subjectName: {
            type: String,
            trim: true,
        },
        classSection: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClassSection',
        },
        classStr: {
            type: String,
            trim: true,
        },
        term: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Term',
            required: [true, 'Term is required'],
        },
        semester: {
            type: String,
            trim: true,
        },
        components: [{
            name: String,
            score: Number,
            weight: Number,
            type: { type: String, enum: ['attendance', 'midterm', 'final', 'custom'] }
        }],
        isExamBanned: {
            type: Boolean,
            default: false
        },
        totalScore: {
            type: Number,
            min: 0,
            max: 10,
            default: null,
        },
        gpa4: {
            type: Number,
            min: 0,
            max: 4,
            default: null,
        },
        letterGrade: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate grades
gradeSchema.index({ studentId: 1, subjectCode: 1, semester: 1 }, { unique: true });

// Pre-save: calculate totalScore, gpa4 and letterGrade
gradeSchema.pre('save', function (next) {
    if (this.isExamBanned) {
        this.totalScore = 0;
        this.gpa4 = 0;
        this.letterGrade = 'F';
    } else if (this.components && this.components.length > 0) {
        let total = 0;
        let isComplete = true;

        // Check if all components have scores (if not, we might not want to finalize totalScore or we set it anyway)
        // Usually, totalScore is finalized when the components' weights sum to 100% and they all have scores.
        let totalWeight = 0;
        for (const comp of this.components) {
            if (comp.score == null) {
                isComplete = false;
                break;
            }
            total += (comp.score * comp.weight) / 100;
            totalWeight += comp.weight;
        }

        if (isComplete && totalWeight === 100) {
            this.totalScore = Math.round(total * 100) / 100;

            // GPA 4.0 and Letter Grade Mapping (University Standard)
            if (this.totalScore >= 9.0) {
                this.gpa4 = 4.0;
                this.letterGrade = 'A+';
            } else if (this.totalScore >= 8.5) {
                this.gpa4 = 4.0;
                this.letterGrade = 'A';
            } else if (this.totalScore >= 8.0) {
                this.gpa4 = 3.5;
                this.letterGrade = 'B+';
            } else if (this.totalScore >= 7.0) {
                this.gpa4 = 3.0;
                this.letterGrade = 'B';
            } else if (this.totalScore >= 6.5) {
                this.gpa4 = 2.5;
                this.letterGrade = 'C+';
            } else if (this.totalScore >= 5.5) {
                this.gpa4 = 2.0;
                this.letterGrade = 'C';
            } else if (this.totalScore >= 5.0) {
                this.gpa4 = 1.5;
                this.letterGrade = 'D+';
            } else if (this.totalScore >= 4.0) {
                this.gpa4 = 1.0;
                this.letterGrade = 'D';
            } else if (this.totalScore >= 3.0) {
                this.gpa4 = 0.5;
                this.letterGrade = 'F+';
            } else {
                this.gpa4 = 0;
                this.letterGrade = 'F';
            }
        } else {
            this.totalScore = null;
            this.gpa4 = null;
            this.letterGrade = null;
        }
    }
    next();
});

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
