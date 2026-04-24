const { connectDB, sequelize } = require("./config/db");
require("dotenv").config();
require("./models");

const { User, Course, Lesson } = require("./models");

const seedData = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  // Create Admin
  const admin = await User.create({
    name: "Admin",
    email: "admin@brainpath.com",
    password: "admin123",
    role: "admin",
  });
  console.log("Admin created: admin@brainpath.com / admin123");

  // Create Instructors
  const instructor1 = await User.create({
    name: "Rahul Sharma",
    email: "rahul@brainpath.com",
    password: "instructor123",
    role: "instructor",
    bio: "Senior Full-Stack Developer with 8+ years of experience",
  });

  const instructor2 = await User.create({
    name: "Priya Patel",
    email: "priya@brainpath.com",
    password: "instructor123",
    role: "instructor",
    bio: "Data Scientist & AI Engineer at Google",
  });
  console.log("Instructors created");

  // Create Student
  const student = await User.create({
    name: "Shiva Kumar",
    email: "shiva@brainpath.com",
    password: "student123",
    role: "student",
    xpPoints: 100,
    streak: 3,
  });
  console.log("Student created: shiva@brainpath.com / student123");

  // Course 1: React JS
  const course1 = await Course.create({
    title: "Complete React JS - Zero to Hero",
    description: "Master React JS from scratch. Learn components, hooks, state management, routing, API integration, and build real-world projects. This course covers everything you need to become a professional React developer.",
    category: "Web Development",
    level: "beginner",
    price: 0,
    status: "approved",
    rating: 4.5,
    totalStudents: 150,
    instructorId: instructor1.id,
  });

  await Lesson.bulkCreate([
    { title: "Introduction to React", content: "React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta. React uses a component-based architecture that makes building complex UIs simple and efficient.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 1, duration: 15, courseId: course1.id },
    { title: "JSX and Components", content: "JSX is a syntax extension for JavaScript that looks similar to HTML. It allows you to write HTML-like code in your JavaScript files. Components are the building blocks of React applications.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 2, duration: 20, courseId: course1.id },
    { title: "Props and State", content: "Props are used to pass data from parent to child components. State is used to manage data that changes over time within a component. Together they form the core of React data flow.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 3, duration: 25, courseId: course1.id },
    { title: "React Hooks - useState & useEffect", content: "Hooks let you use state and other React features in functional components. useState manages state, useEffect handles side effects like API calls and subscriptions.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 4, duration: 30, courseId: course1.id },
    { title: "React Router - Navigation", content: "React Router enables navigation between different pages in a single-page application. Learn how to set up routes, use Link components, and handle dynamic URLs.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 5, duration: 20, courseId: course1.id },
  ]);

  // Course 2: Node.js
  const course2 = await Course.create({
    title: "Node.js & Express - Backend Development",
    description: "Learn backend development with Node.js and Express. Build REST APIs, connect to databases, implement authentication, handle file uploads, and deploy your applications.",
    category: "Web Development",
    level: "intermediate",
    price: 0,
    status: "approved",
    rating: 4.7,
    totalStudents: 200,
    instructorId: instructor1.id,
  });

  await Lesson.bulkCreate([
    { title: "Introduction to Node.js", content: "Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows you to run JavaScript on the server side, enabling full-stack JavaScript development.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 1, duration: 15, courseId: course2.id },
    { title: "Express Framework Basics", content: "Express is a minimal and flexible Node.js web application framework. It provides features for web and mobile applications including routing, middleware, and template engines.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 2, duration: 25, courseId: course2.id },
    { title: "REST API Design", content: "Learn how to design RESTful APIs following best practices. Understand HTTP methods (GET, POST, PUT, DELETE), status codes, request/response patterns, and API versioning.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 3, duration: 30, courseId: course2.id },
    { title: "Database Integration with MySQL", content: "Connect your Node.js application to MySQL database. Learn about Sequelize ORM, model definitions, associations, migrations, and CRUD operations.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 4, duration: 35, courseId: course2.id },
    { title: "Authentication with JWT", content: "Implement secure authentication using JSON Web Tokens. Learn about password hashing with bcrypt, token generation, middleware protection, and role-based access control.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 5, duration: 30, courseId: course2.id },
  ]);

  // Course 3: Python for Data Science
  const course3 = await Course.create({
    title: "Python for Data Science & AI",
    description: "Start your data science journey with Python. Learn NumPy, Pandas, Matplotlib, Scikit-learn, and build machine learning models from scratch.",
    category: "Data Science",
    level: "beginner",
    price: 0,
    status: "approved",
    rating: 4.8,
    totalStudents: 300,
    instructorId: instructor2.id,
  });

  await Lesson.bulkCreate([
    { title: "Python Basics for Data Science", content: "Learn Python fundamentals needed for data science including variables, data types, loops, functions, and list comprehensions.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 1, duration: 20, courseId: course3.id },
    { title: "NumPy - Numerical Computing", content: "NumPy is the fundamental package for scientific computing in Python. Learn about arrays, mathematical operations, broadcasting, and linear algebra.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 2, duration: 25, courseId: course3.id },
    { title: "Pandas - Data Analysis", content: "Pandas provides data structures and tools for data manipulation. Learn DataFrames, data cleaning, filtering, grouping, and merging datasets.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 3, duration: 30, courseId: course3.id },
    { title: "Data Visualization with Matplotlib", content: "Create stunning visualizations with Matplotlib and Seaborn. Learn line plots, bar charts, histograms, scatter plots, and customization techniques.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 4, duration: 25, courseId: course3.id },
    { title: "Introduction to Machine Learning", content: "Understand the basics of machine learning including supervised vs unsupervised learning, regression, classification, and model evaluation.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 5, duration: 35, courseId: course3.id },
  ]);

  // Course 4: AI & Machine Learning
  const course4 = await Course.create({
    title: "AI & Machine Learning Masterclass",
    description: "Deep dive into artificial intelligence and machine learning. Build neural networks, understand deep learning, NLP, computer vision, and deploy AI models.",
    category: "AI & ML",
    level: "advanced",
    price: 0,
    status: "approved",
    rating: 4.6,
    totalStudents: 120,
    instructorId: instructor2.id,
  });

  await Lesson.bulkCreate([
    { title: "What is Artificial Intelligence?", content: "Understand the fundamentals of AI, its history, types (narrow vs general AI), and current applications in real-world industries.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 1, duration: 20, courseId: course4.id },
    { title: "Neural Networks from Scratch", content: "Learn how neural networks work at a fundamental level. Understand neurons, layers, activation functions, forward propagation, and backpropagation.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 2, duration: 40, courseId: course4.id },
    { title: "Deep Learning with TensorFlow", content: "Build deep learning models using TensorFlow and Keras. Learn about CNNs for image recognition and RNNs for sequence data.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 3, duration: 45, courseId: course4.id },
    { title: "Natural Language Processing", content: "Process and understand human language with NLP techniques. Learn tokenization, sentiment analysis, text classification, and transformers.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 4, duration: 35, courseId: course4.id },
    { title: "Deploying AI Models", content: "Take your AI models from notebook to production. Learn about model serving, REST APIs for ML, Docker containers, and cloud deployment.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 5, duration: 30, courseId: course4.id },
  ]);

  // Course 5: Mobile Development
  const course5 = await Course.create({
    title: "React Native - Build Mobile Apps",
    description: "Build cross-platform mobile applications with React Native. Use your React knowledge to create iOS and Android apps with a single codebase.",
    category: "Mobile Development",
    level: "intermediate",
    price: 0,
    status: "approved",
    rating: 4.4,
    totalStudents: 85,
    instructorId: instructor1.id,
  });

  await Lesson.bulkCreate([
    { title: "React Native Setup & Basics", content: "Set up your React Native development environment. Understand the difference between React and React Native, and build your first mobile app.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 1, duration: 20, courseId: course5.id },
    { title: "Core Components & Styling", content: "Learn React Native core components like View, Text, Image, ScrollView, and FlatList. Style your app with StyleSheet and Flexbox.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 2, duration: 25, courseId: course5.id },
    { title: "Navigation in React Native", content: "Implement navigation using React Navigation library. Learn stack navigation, tab navigation, drawer navigation, and passing parameters.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 3, duration: 30, courseId: course5.id },
    { title: "API Integration & State Management", content: "Connect your app to REST APIs, handle loading states, and manage application state using Context API or Redux.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 4, duration: 35, courseId: course5.id },
    { title: "Publishing Your App", content: "Prepare your app for production. Learn about app signing, creating builds for iOS and Android, and publishing to App Store and Google Play.", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", order: 5, duration: 25, courseId: course5.id },
  ]);

  // Course 6 (Pending - for admin to approve)
  await Course.create({
    title: "DevOps for Beginners",
    description: "Learn DevOps fundamentals including CI/CD, Docker, Kubernetes, AWS, and monitoring. Perfect for developers who want to understand deployment.",
    category: "DevOps",
    level: "beginner",
    price: 0,
    status: "pending",
    instructorId: instructor1.id,
  });

  console.log("\n=== Seed Complete ===");
  console.log("\nLogin Credentials:");
  console.log("Admin:      admin@brainpath.com / admin123");
  console.log("Instructor: rahul@brainpath.com / instructor123");
  console.log("Instructor: priya@brainpath.com / instructor123");
  console.log("Student:    shiva@brainpath.com / student123");
  console.log("\n5 Approved Courses + 1 Pending Course created");
  console.log("25 Lessons created across all courses");

  process.exit(0);
};

seedData().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
