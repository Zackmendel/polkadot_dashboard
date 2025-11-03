# subscan.py
import requests
import json
import pandas as pd
import time
from datetime import datetime
import streamlit as st

# ---- Subscan API Functions ----

def get_token_metadata(chain_key, api_key):
    """
    Fetch token metadata (symbol, decimals, price) for a given chain.
    (Keeps your logic but adds support for 'native' detection if available.)
    """
    url = f"https://{chain_key}.api.subscan.io/api/scan/token"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    try:
        res = requests.get(url, headers=headers)
        data = res.json()
        if data.get("code") == 0:
            # Prefer native token if available
            for token_info in data["data"]["detail"].values():
                if token_info.get("is_native"):
                    return {
                        "symbol": token_info["symbol"],
                        "decimals": int(token_info["token_decimals"]),
                        "price": float(token_info.get("price", 0.0))
                    }
            # fallback to first
            token = list(data["data"]["detail"].values())[0]
            return {
                "symbol": token["symbol"],
                "decimals": int(token["token_decimals"]),
                "price": float(token.get("price", 0.0))
            }
    except Exception as e:
        print(f"Error fetching token metadata: {e}")
    return {"symbol": "N/A", "decimals": 10, "price": 0.0}


def fetch_account_data(chain_key, account_key, api_key):
    """
    Fetch account data from Subscan API.
    """
    url = f"https://{chain_key}.api.subscan.io/api/v2/scan/search"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    payload = json.dumps({"key": account_key})
    response = requests.post(url, headers=headers, data=payload)
    response.raise_for_status()
    data = response.json()

    if data.get("code") != 0:
        raise Exception(f"Subscan API Error: {data.get('message')}")
    return data


def fetch_all_transfers(chain_key, address, api_key, max_pages=None, delay=0.3):
    """
    Fetch all token transfers for an address from Subscan API v2.
    """
    url = f"https://{chain_key}.api.subscan.io/api/v2/scan/transfers"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json",
    }

    all_transfers = []
    page = 0
    row = 100

    while True:
        payload = {
            "address": address,
            "direction": "all",
            "row": row,
            "page": page
        }

        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.status_code != 200:
            print(f"HTTP {response.status_code}: {response.text}")
            break

        data = response.json()
        if data.get("code") != 0:
            print(f"Subscan Error: {data.get('message')}")
            break

        transfers = data.get("data", {}).get("transfers", [])
        if not transfers:
            break

        all_transfers.extend(transfers)
        print(f"Fetched page {page + 1} ({len(transfers)} items)...")

        if len(transfers) < row:
            break

        page += 1
        if max_pages and page >= max_pages:
            break

        time.sleep(delay)

    if not all_transfers:
        return pd.DataFrame()

    df = pd.DataFrame(all_transfers)
    if "block_timestamp" in df.columns:
        df["datetime"] = pd.to_datetime(df["block_timestamp"], unit="s")
    df = df.sort_values("datetime", ascending=False).reset_index(drop=True)
    return df


def flatten_json(y, prefix=''):
    """
    Flatten nested JSON for easier DataFrame display.
    """
    out = {}
    for k, v in y.items():
        key = f"{prefix}{k}" if prefix == '' else f"{prefix}.{k}"
        if isinstance(v, dict):
            out.update(flatten_json(v, key))
        elif isinstance(v, list):
            out[key] = json.dumps(v, indent=2)
        else:
            out[key] = v
    return out


# =========================
# ⚙️ Fetch Extrinsics Data
# =========================

def fetch_extrinsics(chain_key, address, api_key, page=0, row=50, order="asc", success=True, timeout=15):
    """
    Fetch extrinsics for a given address from Subscan API v2.
    (Keeps your existing logic and parameters)
    """
    url = f"https://{chain_key}.api.subscan.io/api/v2/scan/extrinsics"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    payload = json.dumps({
        "address": address,
        "order": order,
        "page": page,
        "row": row,
        "success": success,
        "timeout": 0
    })

    try:
        response = requests.post(url, headers=headers, data=payload, timeout=timeout)
        data = response.json()

        if data.get("code") == 0:
            extrinsics = data["data"].get("extrinsics", [])
            if not extrinsics:
                return pd.DataFrame()

            df = pd.DataFrame(extrinsics)

            if "block_timestamp" in df.columns:
                df["datetime"] = df["block_timestamp"].apply(
                    lambda ts: datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")
                )

            return df
        else:
            print(f"Subscan API Error: {data.get('message')}")
            return pd.DataFrame()
    except Exception as e:
        print(f"Extrinsics fetch failed: {e}")
        return pd.DataFrame()


# ==================================
# 🪙 New Additions from New Template
# ==================================

def fetch_staking_history(chain_key, address, api_key):
    """
    Fetch staking reward/slash history for an address.
    """
    url = f"https://{chain_key}.api.subscan.io/api/scan/staking_history"
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    payload = json.dumps({"address": address, "page": 0, "row": 100})  # Fetch up to 100 records
    try:
        response = requests.post(url, headers=headers, data=payload)
        data = response.json()
        if data.get("code") == 0 and data["data"].get("list"):
            df = pd.DataFrame(data["data"]["list"])
            df["datetime"] = pd.to_datetime(df["block_timestamp"], unit="s")
            return df
    except Exception as e:
        print(f"Staking history fetch failed: {e}")
    return pd.DataFrame()


def fetch_referenda_votes(chain_key, address, api_key):
    """
    Fetch governance referenda votes for an address.
    """
    url = f"https://{chain_key}.api.subscan.io/api/scan/gov/votes"
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    payload = json.dumps({"address": address, "page": 0, "row": 100})  # Fetch up to 100 records
    try:
        response = requests.post(url, headers=headers, data=payload)
        data = response.json()
        if data.get("code") == 0 and data["data"].get("list"):
            df = pd.DataFrame(data["data"]["list"])
            df["datetime"] = pd.to_datetime(df["block_timestamp"], unit="s")
            return df
    except Exception as e:
        print(f"Referenda votes fetch failed: {e}")
    return pd.DataFrame()


@st.cache_data(show_spinner=False)
def get_full_account_snapshot(chain_key, account_key, api_key):
    """
    Fetch and cache all Subscan data about an account in one place.
    This can later be passed to an OpenAI chatbot for reasoning.
    """
    snapshot = {}

    # 1. Basic info
    snapshot["account_data"] = fetch_account_data(chain_key, account_key, api_key)

    # Extract address if needed
    address = (
        snapshot["account_data"].get("data", {}).get("account", {}).get("address")
        or account_key
    )

    # 2. Token metadata
    snapshot["token_metadata"] = get_token_metadata(chain_key, api_key)

    # 3. Transfers
    snapshot["transfers"] = fetch_all_transfers(chain_key, address, api_key).to_dict(orient="records")

    # 4. Extrinsics
    snapshot["extrinsics"] = fetch_extrinsics(chain_key, address, api_key).to_dict(orient="records")

    # 5. Staking history
    snapshot["staking_history"] = fetch_staking_history(chain_key, address, api_key).to_dict(orient="records")

    # 6. Governance votes
    snapshot["referenda_votes"] = fetch_referenda_votes(chain_key, address, api_key).to_dict(orient="records")

    # Timestamp
    snapshot["last_updated"] = datetime.utcnow().isoformat()

    return snapshot