import sys
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from datetime import datetime, timedelta
import traceback
import warnings

def main():
    try:
        if sys.stdin.isatty():
            raise ValueError("No input data provided via stdin")

        try:
            input_data = json.load(sys.stdin)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON input")

        if not isinstance(input_data, list) or len(input_data) == 0:
            raise ValueError("Input data must be a non-empty array")

        required_columns = {'date', 'totalRevenue'}
        df = pd.DataFrame(input_data)
        if not required_columns.issubset(df.columns):
            missing = required_columns - set(df.columns)
            raise ValueError(f"Missing required columns: {missing}")

        try:
            df['date'] = pd.to_datetime(df['date'])
            if df['date'].isnull().any():
                raise ValueError("Invalid date format in input data")

            df['timestamp'] = df['date'].map(pd.Timestamp.timestamp)
            X = df[['timestamp']]
            y = df['totalRevenue']
        except Exception as e:
            raise ValueError(f"Data processing error: {str(e)}")

        model = LinearRegression()
        model.fit(X, y)
        y_pred = model.predict(X)
        r2 = r2_score(y, y_pred)

        warning_message = None
        if r2 < 0.5:
            warning_message = f"Low model accuracy (R²={r2:.2f}), predictions may be unreliable"
            warnings.warn(warning_message)

        last_date = df['date'].max()
        future_dates = [last_date + timedelta(days=i) for i in range(1, 8)]
        future_df = pd.DataFrame({'timestamp': [d.timestamp() for d in future_dates]})
        predicted_revenue = model.predict(future_df)
        predicted_revenue = np.maximum(predicted_revenue, 0)

        output = {
            "forecast": [
                {
                    "date": d.strftime("%Y-%m-%d"),
                    "predictedRevenue": round(float(p), 2),
                    "confidence": "high" if r2 >= 0.7 else "medium" if r2 >= 0.5 else "low"
                }
                for d, p in zip(future_dates, predicted_revenue)
            ],
            "modelMetrics": {
                "rSquared": round(r2, 3),
                "intercept": round(float(model.intercept_), 2),
                "coefficient": round(float(model.coef_[0]), 6)
            },
            "inputSummary": {
                "dateRange": {
                    "start": df['date'].min().strftime("%Y-%m-%d"),
                    "end": df['date'].max().strftime("%Y-%m-%d")
                },
                "dataPoints": len(df)
            }
        }

        result = {
            "success": True,
            "data": output
        }

        if warning_message:
            result["warning"] = warning_message

        print(json.dumps(result))

    except ValueError as e:
        print(json.dumps({"success": False, "error": str(e)}))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": "Unexpected error",
            "details": str(e),
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
