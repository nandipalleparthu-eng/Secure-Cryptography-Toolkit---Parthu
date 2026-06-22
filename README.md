1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

     Secure Cryptography Toolkit
A modern, desktop-based Python application that implements the primary primitives of cybersecurity: Symmetric Encryption (AES), Asymmetric Encryption (RSA), Hashing (SHA-256), and Digital Signatures (RSA PKCS#1 v1.5).
This toolkit features a sleek, custom dark-slate GUI built with standard Python tkinter and is designed as an educational, interactive, and production-representative cybersecurity project.
📸 Key Features
RSA Keypair Generator: Generate 2048-bit RSA key pairs exported to standard PEM files (public.pem and private.pem).
AES-256 EAX File Cipher: Encrypt and decrypt files of any size using AES-256 in EAX mode, providing both confidentiality and authenticated integrity check.
Hybrid AES-RSA Exchange: Demonstrates how commercial protocols (SSL/TLS, HTTPS, PGP) work. Bulk data is encrypted with a random AES key, and that AES key is encrypted with the recipient's RSA Public Key.
SHA-256 File Hasher: Compute cryptographic checksums of files using a memory-efficient chunk-based hashing process.
Integrity Checker: Compare files or verify files against a known hash to detect unauthorized alterations (tampering).
Digital Signatures: Sign files with an RSA Private Key and verify their authenticity using the Public Key (provides Non-repudiation and Authenticity).
Performance Benchmarking: Compare the speeds of AES-256 (symmetric) and RSA-2048 (asymmetric) to understand the architectural trade-offs.
Export Project Report: Generate a full project report in markdown format containing theoretical details, session logs, benchmarking charts, and viva/interview questions.
Real-time Console Log: An integrated visual terminal at the bottom of the GUI displaying step-by-step cryptographic operation details.
📂 Folder Structure
code
Text
SecureCryptoProject/
│
├── main.py                # Main Application & Tkinter GUI
│
├── README.md              # Project Documentation
│
├── modules/               # Core Cryptographic Functionality
│   ├── __init__.py        # Package initialization
│   ├── aes_module.py      # AES-256 EAX encryption & decryption
│   ├── rsa_module.py      # RSA-2048 keygen & PKCS1_OAEP key encryption
│   ├── hash_module.py     # SHA-256 chunked hashing & verification
│   ├── signature_module.py# RSA signature creation & verification
│   └── report_module.py   # Benchmark execution & Report generation
│
├── keys/                  # Directory for PEM files (public.pem, private.pem)
├── encrypted_files/       # Directory for encrypted outputs (.enc, .key)
├── signatures/            # Directory for digital signature files (.sig)
├── test_files/            # Directory for user testing documents
└── reports/               # Directory for exported Markdown reports
🚀 Getting Started
Prerequisites
OS: Windows 10/11
Python: Python 3.10 or higher
Libraries: pycryptodome (Cryptography library)
Step 1: Install Dependencies
Open Command Prompt or PowerShell and install pycryptodome via pip:
code
Bash
pip install pycryptodome
(No OpenSSL installations, virtual machines, or Kali Linux are needed).
Step 2: Run the Toolkit
Navigate to the project directory and run the application:
code
Bash
python main.py
🛠️ Cryptographic Details
AES-256 EAX
Symmetric Cipher: Uses a single key. EAX is an AEAD (Authenticated Encryption with Associated Data) mode.
Encrypted File Layout: The output file prepends a 16-byte random nonce and a 16-byte authenticity tag before the raw ciphertext. If the file is altered by even one bit, decryption will fail, alerting you to a tamper attempt.
RSA-2048 PKCS1_OAEP
Asymmetric Cipher: Uses public/private key pair. PKCS#1 OAEP is a randomized padding scheme making asymmetric ciphertexts secure against chosen-ciphertext attacks.
Hybrid Cryptography (The SSL/TLS Flow)
To secure file transfers:
The sender generates an ephemeral, random 32-byte AES key.
The sender encrypts the file using AES-256.
The sender encrypts the 32-byte AES key using the receiver's RSA public key.
The receiver decrypts the AES key using their RSA private key.
The receiver decrypts the file payload using the decrypted AES key.
Digital Signatures (PKCS#1 v1.5)
Hash the file with SHA-256.
Encrypt the hash using the RSA Private Key to generate a .sig signature file.
The verifier recomputes the file hash and decrypts the signature using the Public Key. If they match, the identity and content integrity are proven.
Project Report Outline
Subject: Secure Cryptography Toolkit
Course: Cybersecurity CSE-401
This is a sample document used to demonstrate:
Symmetric File Encryption using AES-256 (EAX).
SHA-256 Hashing and Integrity checking.
Asymmetric digital signatures (RSA) for authenticity.
If you encrypt this file, you will create a sample_document.txt.enc file.
If you sign it, you will get a sample_document.txt.sig file.
If you calculate its SHA-256, you will get a 64-character hash digest.
Secure Cryptography Toolkit Implementation Plan
Develop a professional-grade, desktop-based Python application on Windows 10/11 called Secure Crypto Toolkit. The application will feature a modern, visually stunning Tkinter-based user interface with a custom dark-mode theme, implementing AES-256 (EAX mode) file encryption/decryption, RSA-2048 key generation and hybrid key exchange, SHA-256 hashing for file integrity verification, and digital signatures. It will also feature a Performance Benchmark dashboard (comparing AES vs. RSA speeds) and a real-time console logger for educational visualization.
User Review Required
IMPORTANT
Python Dependencies: The project requires pycryptodome library. The plan includes installing this package via pip.
Standard Tkinter UI: We will use standard Tkinter and tkinter.ttk but apply a custom modern dark-theme configuration (deep slate background, flat buttons, accent borders, clean typography) to avoid external UI dependencies while delivering a highly polished interface.
Hybrid Encryption Process: To encrypt files securely, we generate a random 256-bit AES key, encrypt the file using AES-256 (EAX), and then encrypt that AES key using RSA-2048. We will provide dedicated controls for both raw AES file encryption (with manual key input/generation) and Hybrid AES-RSA encryption.
Open Questions
NOTE
File Output Formats: For AES encryption, the encrypted file will be saved in format [filename].enc containing [nonce (16 bytes)] + [tag (16 bytes)] + [ciphertext]. For Digital Signatures, the signature will be saved as [filename].sig in binary format. Do you have any other preference for file names or layouts?
Default Directories: The toolkit will automatically create subfolders keys/, encrypted_files/, signatures/, test_files/, and reports/ in the workspace. Any output files will default to these locations to keep the workspace organized.
Proposed Changes
Component 1: Cryptographic Modules (under modules/)
[NEW]
aes_module.py
This module handles symmetric file encryption and decryption using AES-256 in EAX mode.
generate_aes_key(): Returns a random 32-byte (256-bit) AES key.
encrypt_file(input_filepath, output_filepath, key): Encrypts the file using AES EAX. Prepend the 16-byte nonce and 16-byte tag to the ciphertext.
decrypt_file(input_filepath, output_filepath, key): Reads the nonce (16 bytes) and tag (16 bytes) from the file, decrypts the rest, and verifies integrity.
[NEW]
rsa_module.py
Handles public-key cryptography using RSA-2048.
generate_rsa_keys(keys_dir): Generates a 2048-bit RSA key pair and writes public.pem and private.pem to keys/.
encrypt_aes_key(aes_key, public_key_path): Encrypts a 32-byte AES key using the RSA public key via PKCS1_OAEP.
decrypt_aes_key(encrypted_aes_key, private_key_path): Decrypts an encrypted AES key using the RSA private key via PKCS1_OAEP.
[NEW]
hash_module.py
Provides hashing utility using SHA-256 for integrity checks.
calculate_file_hash(filepath): Reads the file in 4KB chunks and computes the SHA-256 hash.
verify_file_integrity(filepath, expected_hash): Compares the computed SHA-256 hash of a file with the expected hash string.
[NEW]
signature_module.py
Manages file signing and signature verification (Authenticity & Non-repudiation).
sign_file(filepath, private_key_path, signature_path): Hashes the file using SHA-256 and signs the hash using RSA PKCS1_v1_5. Saves the signature as a .sig file.
verify_signature(filepath, public_key_path, signature_path): Recomputes the file hash and verifies the signature using the RSA public key.
[NEW]
report_module.py
Logs all operations to a central session log, handles performance benchmarking, and generates markdown reports.
benchmark_aes_vs_rsa(): Encrypts/decrypts a chunk of data with AES and RSA, records the elapsed time, and calculates the speed ratio (RSA vs. AES).
generate_project_report(log_entries, benchmark_results, output_path): Generates a complete project report in markdown format containing architecture description, algorithm descriptions, test logs, and performance charts (via ASCII/text table).
Component 2: Main Application & User Interface
[NEW]
main.py
The primary entry point of the desktop application.
Builds a custom Tkinter window with a deep slate/dark-mode theme.
Includes a sidebar navigation menu with clean flat buttons:
Dashboard: Brief explanations of cryptosystems, keys, and hashing.
RSA Keys: Panel to generate RSA keys, and view key properties.
AES Encrypt/Decrypt: Panel to encrypt/decrypt files, including option for hybrid key exchange (encrypting the AES key with RSA public key).
Hash & Integrity: Interface to compute SHA-256, select two files or a file and a hash, and verify integrity.
Digital Signatures: Interface to sign files and verify signatures.
Performance & Reports: Runs the benchmarking test, lists operations logs, and generates a printable project report.
Includes a real-time console/logger area at the bottom that displays detailed technical execution logs (e.g. hex outputs, key details, step-by-step math explanations).
Component 3: Project Documentation
[NEW]
README.md
Instructions on installing dependencies, running the application, and a guide to its features.
Verification Plan
Automated Tests
We will write a python script test_crypto_system.py in the scratch directory to run automated verification:
python scratch/test_crypto_system.py
Test 1: Encrypt a test file with a random AES-256 key, decrypt it, and assert the output matches the original file exactly.
Test 2: Calculate a file's SHA-256 hash, append a character to the file, recalculate, and verify the hash has changed.
Test 3: Sign a file, verify the signature is valid. Modify the file, and verify that the signature check fails.
Test 4: Encrypt an AES key with RSA, decrypt it, and verify they match.
Manual Verification
Run python main.py on Windows.
Verify all GUI sections:
Generate RSA keys: check if keys are saved correctly in the keys/ directory.
Encrypt a file (e.g. from test_files/ folder) and check the encrypted_files/ folder for the output.
Decrypt the file, and verify it matches the source.
Verify SHA-256 hash generation, change the file manually in notepad, and verify the integrity check flags it as modified.
Sign a file, and verify signature output in the signatures/ folder.
Run the benchmark tool and check the output tables.
Click "Generate Project Report" and check reports/ folder.
