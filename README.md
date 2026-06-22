# 🔐 Secure Cryptography Toolkit

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Security](https://img.shields.io/badge/Cybersecurity-Cryptography-red)
![AES-256](https://img.shields.io/badge/AES-256-green)
![RSA-2048](https://img.shields.io/badge/RSA--2048-orange)
![SHA-256](https://img.shields.io/badge/SHA--256-purple)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

**A Professional Desktop-Based Cryptography Suite Built with Python & Tkinter**

AES Encryption • RSA Key Exchange • SHA-256 Hashing • Digital Signatures • Performance Benchmarking

</div>

---

# 📖 Overview

**Secure Cryptography Toolkit** is a modern desktop application designed to demonstrate and implement the core cryptographic primitives used in real-world cybersecurity systems.

The project combines:

* 🔒 **AES-256 Encryption**
* 🔑 **RSA-2048 Public Key Cryptography**
* 🧮 **SHA-256 Hashing**
* ✍️ **Digital Signatures**
* ⚡ **Performance Benchmarking**
* 📊 **Automated Report Generation**

The toolkit features a polished dark-themed GUI built using **Python Tkinter**, making complex cryptographic concepts accessible through an interactive interface.

---

# ✨ Features

## 🔑 RSA Key Pair Generation

Generate industry-standard RSA key pairs:

* 2048-bit RSA Keys
* PEM Export Format
* Public Key (`public.pem`)
* Private Key (`private.pem`)
* Secure PKCS#1 OAEP Support

---

## 🔒 AES-256 File Encryption

Encrypt and decrypt files using:

* AES-256
* EAX Mode (Authenticated Encryption)
* Random Nonce Generation
* Integrity Verification

### Benefits

✅ Confidentiality
✅ Integrity Protection
✅ Tamper Detection

---

## 🔄 Hybrid AES-RSA Encryption

Demonstrates how modern systems such as:

* HTTPS
* SSL/TLS
* PGP
* Secure Email

actually work.

### Workflow

```text
File
 │
 ▼
AES-256 Encrypt
 │
 ▼
Random AES Key
 │
 ▼
Encrypt AES Key using RSA Public Key
 │
 ▼
Transmit Securely
```

Receiver:

```text
RSA Private Key
       │
       ▼
Decrypt AES Key
       │
       ▼
Decrypt AES File
```

---

## 🧮 SHA-256 Hashing

Generate cryptographic fingerprints for files.

Features:

* Chunk-Based Processing
* Memory Efficient
* Large File Support
* 64-Character Hash Output

Example:

```text
3f786850e387550fdab836ed7e6dc881de23001b...
```

---

## 🛡️ Integrity Verification

Detect unauthorized modifications.

Compare:

* File vs File
* File vs Known Hash

Ideal for:

* Malware Detection
* Secure Downloads
* Forensic Analysis
* Data Validation

---

## ✍️ Digital Signatures

Verify authenticity and ownership of files.

### Signing Process

```text
File
 │
 ▼
SHA-256 Hash
 │
 ▼
Sign with RSA Private Key
 │
 ▼
Signature (.sig)
```

### Verification Process

```text
File
 │
 ▼
SHA-256 Hash
 │
 ▼
Verify Signature
 │
 ▼
Authenticity Confirmed
```

Provides:

* Non-Repudiation
* Integrity
* Authentication

---

## ⚡ Performance Benchmark Dashboard

Compare cryptographic performance:

| Algorithm | Type       | Speed     |
| --------- | ---------- | --------- |
| AES-256   | Symmetric  | Very Fast |
| RSA-2048  | Asymmetric | Slower    |
| SHA-256   | Hashing    | Fast      |

Learn why real-world systems use:

* RSA for key exchange
* AES for bulk encryption

---

## 📄 Project Report Generator

Generate a complete markdown report containing:

* Project Architecture
* Cryptographic Theory
* Benchmark Results
* Session Logs
* Viva Questions
* Security Analysis

Perfect for:

* College Projects
* Cybersecurity Labs
* Viva Examinations
* Documentation

---

# 🏗️ Project Structure

```text
SecureCryptoProject/
│
├── main.py
├── README.md
│
├── modules/
│   ├── __init__.py
│   ├── aes_module.py
│   ├── rsa_module.py
│   ├── hash_module.py
│   ├── signature_module.py
│   └── report_module.py
│
├── keys/
│   ├── public.pem
│   └── private.pem
│
├── encrypted_files/
│
├── signatures/
│
├── test_files/
│
└── reports/
```

---

# 🚀 Installation

## Prerequisites

| Requirement | Version       |
| ----------- | ------------- |
| Python      | 3.10+         |
| OS          | Windows 10/11 |
| Library     | PyCryptodome  |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/SecureCryptoProject.git

cd SecureCryptoProject
```

---

## Step 2 — Install Dependencies

```bash
pip install pycryptodome
```

Verify installation:

```bash
python -c "from Crypto.Cipher import AES; print('Installed Successfully')"
```

---

## Step 3 — Run the Application

```bash
python main.py
```

---

# 🔐 Cryptographic Implementation

## AES-256 EAX Mode

### Encryption Layout

```text
Encrypted File

[16-byte Nonce]
       +
[16-byte Authentication Tag]
       +
[Ciphertext]
```

### Security Benefits

* Confidentiality
* Integrity Verification
* Replay Protection
* Tamper Detection

---

## RSA-2048 OAEP

### Key Pair

```text
Public Key
     │
Encrypt
     ▼
Ciphertext
     ▲
Decrypt
     │
Private Key
```

Uses:

* RSA-2048
* PKCS#1 OAEP Padding

OAEP protects against:

* Chosen Ciphertext Attacks
* Replay Attacks
* Padding Oracle Vulnerabilities

---

## SHA-256

Produces:

```text
256-bit Digest
64 Hex Characters
```

Example:

```text
A1B2C3D4E5F6...
```

Used for:

* Integrity Verification
* File Fingerprinting
* Digital Signatures

---

## Digital Signatures

Uses:

```text
SHA-256 + RSA PKCS#1 v1.5
```

Workflow:

```text
Hash File
     │
     ▼
Sign Hash
     │
     ▼
Generate Signature
```

Verification:

```text
Verify Signature
     │
     ▼
Validate Authenticity
```

---

# 🖥️ GUI Modules

## 🏠 Dashboard

Overview of:

* Cryptography Basics
* Security Concepts
* Algorithm Descriptions

---

## 🔑 RSA Keys

Functions:

* Generate RSA Keys
* View Key Details
* Export PEM Files

---

## 🔒 AES Encrypt / Decrypt

Functions:

* Encrypt Files
* Decrypt Files
* Generate AES Keys
* Hybrid Encryption

---

## 🧮 Hash & Integrity

Functions:

* Generate SHA-256
* Compare Hashes
* Verify File Integrity

---

## ✍️ Digital Signatures

Functions:

* Sign Files
* Verify Signatures
* Manage Signature Files

---

## 📊 Performance & Reports

Functions:

* Benchmark AES vs RSA
* Generate Reports
* View Session Logs

---

# 🧪 Testing

## Automated Tests

Run:

```bash
python test_crypto_system.py
```

### Test Cases

### Test 1 — AES Encryption

✔ Encrypt File
✔ Decrypt File
✔ Verify Original Data

---

### Test 2 — SHA-256 Integrity

✔ Generate Hash
✔ Modify File
✔ Verify Hash Changes

---

### Test 3 — Digital Signatures

✔ Sign File
✔ Verify Signature
✔ Detect Tampering

---

### Test 4 — RSA Key Exchange

✔ Encrypt AES Key
✔ Decrypt AES Key
✔ Verify Match

---

# 📊 Sample Benchmark Results

| Operation   | Time (ms) |
| ----------- | --------- |
| AES Encrypt | 3         |
| AES Decrypt | 2         |
| RSA Encrypt | 45        |
| RSA Decrypt | 120       |

> Actual values depend on hardware specifications.

---

# 🎓 Educational Value

This project demonstrates:

* Symmetric Cryptography
* Asymmetric Cryptography
* Hybrid Encryption
* Digital Signatures
* Integrity Verification
* Secure Key Management
* Real-World Security Architectures

Suitable for:

* B.Tech / B.E Projects
* Cybersecurity Courses
* Academic Demonstrations
* Security Research
* Portfolio Projects

---

# 🔮 Future Enhancements

* ECC (Elliptic Curve Cryptography)
* AES-GCM Support
* Secure File Sharing
* Certificate Management
* Multi-User Key Vault
* Cloud Backup Encryption
* PDF Report Export
* Database Logging

---

# 👨‍💻 Author

**Secure Cryptography Toolkit**

A practical cybersecurity project demonstrating the foundational cryptographic mechanisms used across modern secure communication systems.

---

# 📜 License

This project is intended for:

* Educational Use
* Academic Projects
* Cybersecurity Learning
* Research Purposes

Use responsibly and follow applicable security and legal guidelines.

---

<div align="center">

### 🔐 Secure Crypto Toolkit

**Learn • Encrypt • Verify • Secure**

Built with ❤️ using Python & Modern Cryptography

</div>
