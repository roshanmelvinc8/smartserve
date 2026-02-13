from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # ===== SIMULATED IN-MEMORY DB (no PyMongo until MongoDB installed) =====
    # TODO: swap to PyMongo when MongoDB is available
    class MockDatabase:
        def __init__(self):
            self.users = MockCollection('users')
            self.tokens = MockCollection('tokens')
    
    class MockCollection:
        def __init__(self, name):
            self.name = name
            self.data = []
        
        def insert_one(self, doc):
            from bson.objectid import ObjectId
            doc['_id'] = ObjectId()
            self.data.append(doc)
            class InsertResult:
                def __init__(self, oid):
                    self.inserted_id = oid
            return InsertResult(doc['_id'])
        
        def find_one(self, query):
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    return doc
            return None
        
        def find(self, query):
            from bson.objectid import ObjectId
            results = []
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if isinstance(v, dict):
                        # handle operators like {'$gte': ...}
                        if '$gte' in v:
                            if not (doc.get(k) >= v['$gte']):
                                match = False
                    elif doc.get(k) != v:
                        match = False
                    if not match:
                        break
                if match:
                    results.append(doc)
            
            class FindResult:
                def __init__(self, data):
                    self.data = data
                def sort(self, key, direction):
                    self.data.sort(key=lambda x: x.get(key, ''), reverse=direction < 0)
                    return self
                def limit(self, n):
                    return FindResult(self.data[:n])
            
            return FindResult(results)
        
        def update_one(self, query, update):
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    if '$set' in update:
                        doc.update(update['$set'])
                    class UpdateResult:
                        modified_count = 1
                    return UpdateResult()
            class UpdateResult:
                modified_count = 0
            return UpdateResult()
        
        def update_many(self, query, update):
            count = 0
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    if '$set' in update:
                        doc.update(update['$set'])
                    count += 1
            class UpdateResult:
                def __init__(self, c):
                    self.modified_count = c
            return UpdateResult(count)
        
        def count_documents(self, query):
            count = 0
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if isinstance(v, dict):
                        if '$gte' in v:
                            if not (doc.get(k) >= v['$gte']):
                                match = False
                    elif doc.get(k) != v:
                        match = False
                    if not match:
                        break
                if match:
                    count += 1
            return count
    
    app.db = MockDatabase()

    JWTManager(app)
    CORS(app)

    # register blueprints
    from routes.auth import bp as auth_bp
    from routes.student import bp as student_bp
    from routes.staff import bp as staff_bp
    from routes.admin import bp as admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp, url_prefix='/student')
    app.register_blueprint(staff_bp, url_prefix='/staff')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    @app.route('/health')
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == '__main__':
    app = create_app()
    # Hackathon-ready: runs on localhost only
    app.run(host='127.0.0.1', port=5000, debug=True)
