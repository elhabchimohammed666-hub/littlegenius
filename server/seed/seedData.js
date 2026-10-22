const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Class = require('../models/Class');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Section = require('../models/Section');
const Activity = require('../models/Activity');
const Progress = require('../models/Progress');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/littlegenius';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Class.deleteMany({});
    await Course.deleteMany({});
    await Chapter.deleteMany({});
    await Section.deleteMany({});
    await Activity.deleteMany({});
    await Progress.deleteMany({});

    console.log('👩‍🏫 Creating Teacher account...');
    const teacher = await User.create({
      name: 'Sarah Vance',
      email: 'teacher@littlegenius.edu',
      password: 'Password123!',
      role: 'teacher',
      school: 'Oakridge Elementary School',
      avatar: 'owl',
    });

    console.log('🏫 Creating Class: Grade 4 - Explorers...');
    const explorerClass = await Class.create({
      name: 'Grade 4 - Explorers',
      description: 'Active 4th Grade class discovering fractions, science wonders, and grammar!',
      gradeLevel: 'Grade 4',
      ageGroup: '9 years old',
      color: '#4F46E5',
      teacher: teacher._id,
      code: 'LG-EXP4',
    });

    console.log('🎒 Creating Students (Adam, Emma, Lucas, Maya)...');
    const adam = await User.create({
      name: 'Adam Jenkins',
      email: 'adam@littlegenius.edu',
      password: 'Student123!',
      role: 'student',
      age: 9,
      avatar: 'fox',
      teacher: teacher._id,
      assignedClass: explorerClass._id,
      points: 250,
      streak: 3,
      badges: [
        {
          badgeId: 'welcome',
          title: 'Welcome Adventurer',
          icon: '🌟',
          description: 'Joined the LittleGenius classroom',
          earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          badgeId: 'first_quiz',
          title: 'Curious Learner',
          icon: '🚀',
          description: 'Completed your very first activity!',
          earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    const emma = await User.create({
      name: 'Emma Watson',
      email: 'emma@littlegenius.edu',
      password: 'Student123!',
      role: 'student',
      age: 9,
      avatar: 'owl',
      teacher: teacher._id,
      assignedClass: explorerClass._id,
      points: 340,
      streak: 5,
      badges: [
        {
          badgeId: 'welcome',
          title: 'Welcome Adventurer',
          icon: '🌟',
          description: 'Joined the LittleGenius classroom',
        },
        {
          badgeId: 'perfect_score',
          title: 'Star Genius',
          icon: '⭐',
          description: 'Scored 100% on a challenging activity',
        },
      ],
    });

    const lucas = await User.create({
      name: 'Lucas Smith',
      email: 'lucas@littlegenius.edu',
      password: 'Student123!',
      role: 'student',
      age: 9,
      avatar: 'bear',
      teacher: teacher._id,
      assignedClass: explorerClass._id,
      points: 180,
      streak: 2,
      badges: [
        {
          badgeId: 'welcome',
          title: 'Welcome Adventurer',
          icon: '🌟',
          description: 'Joined the LittleGenius classroom',
        },
      ],
    });

    const maya = await User.create({
      name: 'Maya Patel',
      email: 'maya@littlegenius.edu',
      password: 'Student123!',
      role: 'student',
      age: 9,
      avatar: 'lion',
      teacher: teacher._id,
      assignedClass: explorerClass._id,
      points: 290,
      streak: 4,
      badges: [
        {
          badgeId: 'welcome',
          title: 'Welcome Adventurer',
          icon: '🌟',
          description: 'Joined the LittleGenius classroom',
        },
      ],
    });

    explorerClass.students = [adam._id, emma._id, lucas._id, maya._id];
    await explorerClass.save();

    console.log('📚 Creating Course: Introduction to Fractions (Mathematics)...');
    const fractionsCourse = await Course.create({
      title: 'Introduction to Fractions',
      description: 'Explore equal parts, master halves and quarters, and learn how to add simple fractions with fun visual exercises!',
      subject: 'Mathematics',
      targetAgeMin: 8,
      targetAgeMax: 11,
      icon: 'PieChart',
      themeColor: 'from-amber-400 to-orange-500',
      teacher: teacher._id,
      isPublished: true,
      assignedClasses: [explorerClass._id],
    });

    // Chapter 1: What is a Fraction?
    const chapter1 = await Chapter.create({
      course: fractionsCourse._id,
      title: 'Chapter 1: What is a Fraction?',
      description: 'Discover how whole things can be divided into equal parts.',
      order: 1,
    });

    const section1_1 = await Section.create({
      chapter: chapter1._id,
      course: fractionsCourse._id,
      title: 'Parts of a Whole',
      order: 1,
      content: `Have you ever shared a chocolate bar or sliced a birthday pizza? 

When we divide a single whole object into pieces that are all the exact same size, each piece is called a **fraction**! 

Key Rules to Remember:
1. **Equal Parts**: To be a real fraction, all the slices must have the EXACT SAME size. If one slice is huge and another is tiny, they are not fractions!
2. **The Numerator (Top Number)**: Tells us how many slices we are counting or eating.
3. **The Denominator (Bottom Number)**: Tells us the total number of equal slices the whole was cut into.

Example: If a pizza is cut into 4 equal slices and you eat 1 slice, you ate 1/4 (one quarter) of the pizza!`,
      keyPoints: [
        'A fraction represents equal parts of a whole.',
        'The top number (numerator) tells how many parts you have.',
        'The bottom number (denominator) tells total equal parts.',
      ],
    });

    chapter1.sections.push(section1_1._id);
    await chapter1.save();

    // Chapter 2: Halves and Quarters (The centerpiece scenario from PDF)
    const chapter2 = await Chapter.create({
      course: fractionsCourse._id,
      title: 'Chapter 2: Halves and Quarters',
      description: 'Master dividing wholes into 2 equal parts (halves) and 4 equal parts (quarters).',
      order: 2,
    });

    const section2_1 = await Section.create({
      chapter: chapter2._id,
      course: fractionsCourse._id,
      title: 'Exploring Halves and Quarters',
      order: 1,
      content: `Let's take a closer look at the two most famous fractions in the world: **Halves** and **Quarters**!

🍕 **Understanding Halves (1/2)**:
When you divide any whole item into **2 equal parts**, each part is called **one half**, written as **1/2**.
- Two halves (1/2 + 1/2) make **1 whole**!
- If you split 10 cookies equally with your best friend, each of you gets half (5 cookies).

🍰 **Understanding Quarters (1/4)**:
When you divide a whole into **4 equal parts**, each part is called **one quarter** (or one fourth), written as **1/4**.
- Four quarters (1/4 + 1/4 + 1/4 + 1/4) make **1 whole**!
- Here is a super secret trick: **Two quarters (2/4) are exactly equal to one half (1/2)**! If you eat 2 slices of a 4-slice pizza, you just ate half of the entire pizza!

🔍 **Summary Table**:
- 1 Whole = 2 Halves (2/2)
- 1 Whole = 4 Quarters (4/4)
- 1 Half (1/2) = 2 Quarters (2/4)
- 3 Quarters (3/4) = Three out of four equal pieces`,
      keyPoints: [
        'Halves mean dividing into 2 equal parts (1/2).',
        'Quarters mean dividing into 4 equal parts (1/4).',
        'Two quarters (2/4) equals one half (1/2).',
        'Four quarters (4/4) make one whole.',
      ],
    });

    chapter2.sections.push(section2_1._id);
    await chapter2.save();

    // Create Activity 1: Multiple-Choice Quiz for Chapter 2 Section 1
    const activity2_1_Quiz = await Activity.create({
      section: section2_1._id,
      chapter: chapter2._id,
      course: fractionsCourse._id,
      title: 'Halves and Quarters Quiz',
      type: 'multiple-choice',
      difficulty: 'medium',
      instructions: 'Read each question carefully and click the best answer! Think about pizza slices!',
      isAiGenerated: true,
      aiPromptUsed: 'Generate 4 multiple-choice questions on halves and quarters for 9-year-olds.',
      order: 1,
      content: {
        questions: [
          {
            id: 'q1',
            question: 'If you cut a sheet of paper into 2 equal pieces, what is each piece called?',
            options: ['One quarter (1/4)', 'One half (1/2)', 'One third (1/3)', 'A whole circle'],
            correctIndex: 1,
            explanation: 'When a whole is divided into 2 equal parts, each part is one half (1/2).',
            hint: 'Count the pieces: there are 2 equal pieces.',
          },
          {
            id: 'q2',
            question: 'How many quarters make up one complete whole pizza?',
            options: ['2 quarters', '3 quarters', '4 quarters', '8 quarters'],
            correctIndex: 2,
            explanation: 'Four quarters (4/4) make up the entire whole pizza!',
            hint: 'The word quarter comes from "quart", meaning four.',
          },
          {
            id: 'q3',
            question: 'How many quarters do you need to equal ONE HALF (1/2) of a pie?',
            options: ['1 quarter', '2 quarters', '3 quarters', '4 quarters'],
            correctIndex: 1,
            explanation: 'Two quarters (2/4) cover the exact same area as one half (1/2)!',
            hint: 'Remember: 2 quarters = 1 half.',
          },
          {
            id: 'q4',
            question: 'If Maya eats 3 quarters of an apple pie, how much pie is left for Adam?',
            options: ['1 quarter (1/4)', '2 quarters (2/4)', '1 half (1/2)', 'Nothing left'],
            correctIndex: 0,
            explanation: 'Because 4 quarters make a whole, 4/4 minus 3/4 leaves 1/4 (one quarter) left!',
            hint: 'Subtract 3 from 4.',
          },
        ],
      },
    });

    // Create Activity 2: Matching Challenge for Chapter 2 Section 1
    const activity2_1_Match = await Activity.create({
      section: section2_1._id,
      chapter: chapter2._id,
      course: fractionsCourse._id,
      title: 'Fraction Matching Pairs',
      type: 'matching',
      difficulty: 'medium',
      instructions: 'Click a card on the left, then click its matching partner on the right!',
      isAiGenerated: true,
      aiPromptUsed: 'Generate matching pairs for fractions and word definitions for grade 4.',
      order: 2,
      content: {
        pairs: [
          {
            id: 'p1',
            left: '1/2 (One Half)',
            right: 'One out of 2 equal parts',
            explanation: '1/2 represents one part of a whole cut in two.',
          },
          {
            id: 'p2',
            left: '1/4 (One Quarter)',
            right: 'One out of 4 equal parts',
            explanation: '1/4 represents one part of a whole cut in four.',
          },
          {
            id: 'p3',
            left: '2/4 (Two Quarters)',
            right: 'The same amount as 1/2',
            explanation: 'Two quarters is mathematically equivalent to one half.',
          },
          {
            id: 'p4',
            left: '4/4 (Four Quarters)',
            right: 'One complete whole',
            explanation: 'When all 4 quarters are present, it makes 1 whole.',
          },
        ],
      },
    });

    // Create Activity 3: Fill in the Blanks for Chapter 2 Section 1
    const activity2_1_Fill = await Activity.create({
      section: section2_1._id,
      chapter: chapter2._id,
      course: fractionsCourse._id,
      title: 'Fractions In Action: Word Hunt',
      type: 'fill-blank',
      difficulty: 'easy',
      instructions: 'Choose the correct words from the word bank to fill in the sentences!',
      isAiGenerated: false,
      order: 3,
      content: {
        items: [
          {
            id: 'f1',
            sentence: 'When we split an apple equally into 2 pieces, each piece is called one {blank}.',
            blanks: ['half'],
            options: ['half', 'quarter', 'thousand', 'meter'],
            explanation: 'Two equal parts are called halves.',
          },
          {
            id: 'f2',
            sentence: 'In a fraction, the bottom number is called the {blank}.',
            blanks: ['denominator'],
            options: ['denominator', 'numerator', 'alphabet', 'ruler'],
            explanation: 'The denominator sits at the bottom.',
          },
          {
            id: 'f3',
            sentence: 'It takes {blank} quarters to equal one half.',
            blanks: ['two'],
            options: ['two', 'four', 'ten', 'zero'],
            explanation: '2 quarters = 1 half!',
          },
        ],
      },
    });

    section2_1.activities = [activity2_1_Quiz._id, activity2_1_Match._id, activity2_1_Fill._id];
    await section2_1.save();

    // Chapter 3: Simple Fraction Addition
    const chapter3 = await Chapter.create({
      course: fractionsCourse._id,
      title: 'Chapter 3: Adding Simple Fractions',
      description: 'Learn how easy it is to add fractions when they have the same denominator.',
      order: 3,
    });

    const section3_1 = await Section.create({
      chapter: chapter3._id,
      course: fractionsCourse._id,
      title: 'Adding Like Denominators',
      order: 1,
      content: `When fractions share the same bottom number (denominator), adding them is as simple as adding standard numbers!

Formula:
**Keep the bottom number the same, and add the top numbers!**

Example:
1/4 + 1/4 = 2/4 (which equals 1/2)!

If Adam eats 1 quarter of a watermelon and Emma eats 2 quarters of the watermelon, together they ate:
1/4 + 2/4 = 3/4 of the watermelon!`,
      keyPoints: [
        'Keep the denominator the same.',
        'Add the numerators together.',
        'Simplify if possible (2/4 = 1/2).',
      ],
    });

    chapter3.sections.push(section3_1._id);
    await chapter3.save();

    fractionsCourse.chapters = [chapter1._id, chapter2._id, chapter3._id];
    await fractionsCourse.save();

    // Course 2: Solar System Explorers (Science)
    console.log('🪐 Creating Course: Solar System Explorers (Science)...');
    const scienceCourse = await Course.create({
      title: 'Solar System Explorers',
      description: 'Journey through outer space! Explore the fiery Sun, rocky planets, and swirling gas giants.',
      subject: 'Science',
      targetAgeMin: 7,
      targetAgeMax: 12,
      icon: 'Rocket',
      themeColor: 'from-blue-500 to-indigo-600',
      teacher: teacher._id,
      isPublished: true,
      assignedClasses: [explorerClass._id],
    });

    const sciChapter1 = await Chapter.create({
      course: scienceCourse._id,
      title: 'Chapter 1: The Rocky Planets',
      description: 'Discover the four inner planets closest to the Sun.',
      order: 1,
    });

    const sciSection1 = await Section.create({
      chapter: sciChapter1._id,
      course: scienceCourse._id,
      title: 'Mercury, Venus, Earth, and Mars',
      order: 1,
      content: `Our solar system has 8 planets orbiting around one giant star called the **Sun**.

The four planets closest to the Sun are made of solid rock and metal:
1. **Mercury**: The smallest planet and closest to the Sun. It is scorching hot by day and freezing cold at night!
2. **Venus**: The hottest planet in our solar system because of its thick greenhouse atmosphere.
3. **Earth**: Our wonderful home planet, the only place known to support life with oceans of liquid water!
4. **Mars**: The "Red Planet", covered in rusty red iron dust with giant volcanoes and ancient dry river valleys.`,
      keyPoints: [
        'The Sun is a star at the center of our solar system.',
        'Mercury, Venus, Earth, and Mars are the rocky inner planets.',
        'Earth is the third planet from the Sun and has liquid water.',
      ],
    });

    const sciActivity1 = await Activity.create({
      section: sciSection1._id,
      chapter: sciChapter1._id,
      course: scienceCourse._id,
      title: 'Planet Match Challenge',
      type: 'matching',
      difficulty: 'easy',
      instructions: 'Match each planet with its special feature!',
      isAiGenerated: true,
      order: 1,
      content: {
        pairs: [
          {
            id: 'sp1',
            left: 'Earth',
            right: 'Has oceans of liquid water and life',
            explanation: 'Earth is our unique home planet.',
          },
          {
            id: 'sp2',
            left: 'Mars',
            right: 'Known as the Red Planet',
            explanation: 'Mars looks reddish because of iron oxide (rust) on its surface.',
          },
          {
            id: 'sp3',
            left: 'Sun',
            right: 'The giant star at the center of the system',
            explanation: 'All planets orbit around the Sun.',
          },
        ],
      },
    });

    sciSection1.activities.push(sciActivity1._id);
    await sciSection1.save();
    sciChapter1.sections.push(sciSection1._id);
    await sciChapter1.save();
    scienceCourse.chapters.push(sciChapter1._id);
    await scienceCourse.save();

    // Course 3: Draft course (Not published yet)
    console.log('📝 Creating Draft Course: Grammar Detectives (Language Arts)...');
    const draftCourse = await Course.create({
      title: 'Grammar Detectives: Nouns & Verbs',
      description: 'Solve mysteries by uncovering action verbs, naming nouns, and colorful adjectives.',
      subject: 'Language Arts',
      targetAgeMin: 7,
      targetAgeMax: 10,
      icon: 'BookOpen',
      themeColor: 'from-emerald-400 to-teal-600',
      teacher: teacher._id,
      isPublished: false, // Draft!
      assignedClasses: [explorerClass._id],
    });

    explorerClass.assignedCourses = [fractionsCourse._id, scienceCourse._id, draftCourse._id];
    await explorerClass.save();

    console.log('📊 Seeding Student Progress & Scenarios (Adam, Emma, Lucas, Maya)...');
    // Scenario from PDF Page 9:
    // Adam completes both activities. He understands halves (100%) but struggles with questions about quarters!
    // He scored 2 out of 4 (50%) on quiz, and 100% on matching!
    await Progress.create({
      student: adam._id,
      course: fractionsCourse._id,
      section: section2_1._id,
      activity: activity2_1_Quiz._id,
      class: explorerClass._id,
      isCompleted: false, // Not passed yet (< 60%)
      bestScore: 2,
      latestScore: 2,
      maxScore: 4,
      bestPercentage: 50,
      attemptsCount: 1,
      struggling: true,
      recentMistakes: [
        {
          question: 'How many quarters do you need to equal ONE HALF (1/2) of a pie?',
          details: 'Answered "4 quarters", correct was "2 quarters"',
        },
        {
          question: 'If Maya eats 3 quarters of an apple pie, how much pie is left for Adam?',
          details: 'Answered "2 quarters", correct was "1 quarter"',
        },
      ],
      attempts: [
        {
          attemptNumber: 1,
          score: 2,
          maxScore: 4,
          percentage: 50,
          answers: { q1: 1, q2: 2, q3: 3, q4: 1 },
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
      ],
    });

    await Progress.create({
      student: adam._id,
      course: fractionsCourse._id,
      section: section2_1._id,
      activity: activity2_1_Match._id,
      class: explorerClass._id,
      isCompleted: true,
      bestScore: 4,
      latestScore: 4,
      maxScore: 4,
      bestPercentage: 100,
      attemptsCount: 1,
      struggling: false,
      attempts: [
        {
          attemptNumber: 1,
          score: 4,
          maxScore: 4,
          percentage: 100,
          completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      ],
    });

    // Emma did great (100% on quiz & matching)
    await Progress.create({
      student: emma._id,
      course: fractionsCourse._id,
      section: section2_1._id,
      activity: activity2_1_Quiz._id,
      class: explorerClass._id,
      isCompleted: true,
      bestScore: 4,
      latestScore: 4,
      maxScore: 4,
      bestPercentage: 100,
      attemptsCount: 1,
      struggling: false,
      attempts: [
        {
          attemptNumber: 1,
          score: 4,
          maxScore: 4,
          percentage: 100,
          completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      ],
    });

    // Lucas also struggled with quarters (50%)
    await Progress.create({
      student: lucas._id,
      course: fractionsCourse._id,
      section: section2_1._id,
      activity: activity2_1_Quiz._id,
      class: explorerClass._id,
      isCompleted: false,
      bestScore: 2,
      latestScore: 2,
      maxScore: 4,
      bestPercentage: 50,
      attemptsCount: 1,
      struggling: true,
      recentMistakes: [
        {
          question: 'How many quarters make up one complete whole pizza?',
          details: 'Answered "2 quarters", correct was "4 quarters"',
        },
      ],
      attempts: [
        {
          attemptNumber: 1,
          score: 2,
          maxScore: 4,
          percentage: 50,
          completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ],
    });

    // Maya scored 75%
    await Progress.create({
      student: maya._id,
      course: fractionsCourse._id,
      section: section2_1._id,
      activity: activity2_1_Quiz._id,
      class: explorerClass._id,
      isCompleted: true,
      bestScore: 3,
      latestScore: 3,
      maxScore: 4,
      bestPercentage: 75,
      attemptsCount: 1,
      struggling: false,
      attempts: [
        {
          attemptNumber: 1,
          score: 3,
          maxScore: 4,
          percentage: 75,
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
    });

    console.log('✅ LittleGenius Database Seeded Successfully!');
    console.log('--------------------------------------------------');
    console.log('Teacher Credentials:');
    console.log('  Email:    teacher@littlegenius.edu');
    console.log('  Password: Password123!');
    console.log('');
    console.log('Student Credentials (Scenario):');
    console.log('  Email:    adam@littlegenius.edu (has struggled with quarters)');
    console.log('  Email:    emma@littlegenius.edu (high achiever)');
    console.log('  Email:    lucas@littlegenius.edu');
    console.log('  Email:    maya@littlegenius.edu');
    console.log('  Password: Student123!');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
