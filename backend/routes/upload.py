import io
from flask import Blueprint, request, jsonify
from utils.csv_parser import parse_csv, get_summary
from utils import set_df, get_df

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
def upload_csv():
    """
    Accept a CSV file upload, parse it, and store in memory.
    Returns a summary of the parsed data.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are accepted"}), 400

    try:
        content = file.read().decode("utf-8", errors="replace")
        df = parse_csv(io.StringIO(content))
        set_df(df)
        summary = get_summary(df)
        # Include a small sample of rows
        sample = df.head(5).fillna("").to_dict(orient="records")
        # Convert timestamps in sample
        for row in sample:
            for k, v in row.items():
                if hasattr(v, "isoformat"):
                    row[k] = v.isoformat()
        return jsonify({**summary, "sample_rows": sample}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
