"""Shared in-memory data store for the Flask app."""

_dataframe = None


def get_df():
    return _dataframe


def set_df(df):
    global _dataframe
    _dataframe = df
