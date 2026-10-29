import uvicorn

if __name__ == "__main__":
    print("==================================================")
    print(" Starting E-Commerce Review Moderation Backend...")
    print(" Swagger Docs: http://127.0.0.1:8000/docs")
    print(" SQLite Database: ecommerce.db")
    print("==================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
