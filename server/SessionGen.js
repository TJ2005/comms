const mysql = require('mysql2/promise'); // Use MySQL or change for your DB

class SessionId {
    constructor(sessionCode, user) {
        this.sessionCode = sessionCode; // Unique session code
        this.usernameList = []; // List of usernames
        let settings = {}; // Default private settings
        let admin = null; // Admin user

        // Initialize the DB and check if the session exists
        this.initDb().then(() => this.checkAndCreateSession(user));
        
        // Getter for settings
        this.getSettings = () => {
            return settings;
        };

        // Method to update settings
        this.updateSettings = (newSettings) => {
            settings = { ...settings, ...newSettings };
            this.updateDb(); // Update the database with the new settings
        };
    }

    // Initialize the database connection
    async initDb() {
        //error handling
        try {
            this.connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'Tarnished@314',
                database: 'sessions_db'
            });
            console.log('Database connection established successfully.');
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error; // Throw error to be handled in the calling code if needed
        }
    }

    // Check if the sessionCode already exists, if not create a new session
    async checkAndCreateSession(user) {
        const [rows] = await this.connection.execute(
            'SELECT * FROM sessions WHERE session_code = ?',
            [this.sessionCode]
        );

        if (rows.length > 0) {
            // Session exists, load session details
            const session = rows[0];
            this.sessionId = session.session_id;
            this.usernameList = session.usernames.split(',');
            admin = session.admin;
            settings = JSON.parse(session.settings);
        } else {
            // Session doesn't exist, create a new session
            await this.createSession(user);
        }
    }

    // Create a new session in the database
    async createSession(user) {
        this.sessionId = this.generateSessionId(); // Generate a new sessionId
        this.admin = user; // First user becomes admin
        this.usernameList.push(user); // Add the first user
        const defaultSettings = {}; // Assign default settings

        await this.connection.execute(
            'INSERT INTO sessions (session_id, session_code, usernames, admin, settings) VALUES (?, ?, ?, ?, ?)',
            [this.sessionId, this.sessionCode, user, this.admin, JSON.stringify(defaultSettings)]
        );
    }

    // Generate a unique session ID (simple example, you may want to improve this)
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }

    // Add a username to the session
    joinSession(username) {
        if (!this.usernameList.includes(username)) {
            this.usernameList.push(username);
            this.updateDb(); // Update DB when a user joins
        }
    }

    // Remove a username from the session
    leaveSession(username) {
        if (this.usernameList.includes(username)) {
            this.usernameList = this.usernameList.filter((name) => name !== username);
            this.updateDb(); // Update DB when a user leaves
        }
    }

    // Update session details in the database
    async updateDb() {
        await this.connection.execute(
            'UPDATE sessions SET usernames = ?, admin = ?, settings = ? WHERE session_id = ?',
            [this.usernameList.join(','), this.admin, JSON.stringify(this.getSettings()), this.sessionId]
        );
    }

    // Delete the session from the database
    async deleteSession() {
        await this.connection.execute(
            'DELETE FROM sessions WHERE session_id = ?',
            [this.sessionId]
        );
        console.log(`Session ${this.sessionId} deleted.`);
    }
}

module.exports = SessionId;
