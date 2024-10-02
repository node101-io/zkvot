# ZKvot Backend

The ZKvot backend serves two primary functions:
- **Election Listing**

  Provides a list of all elections for UX purposes without compromising user anonymity. Clients fetch the complete list and perform filtering on the client side.
- **Vote Proof Submission**

  Offers users the ability to submit their vote proof in a secure and verifiable manner. The server ensures transparency by allowing users to verify the transaction submission to the Communication Layer, ensuring users cannot be deceived into believing their submission was completed when it wasn’t.

## Purpose
This backend is designed as an optional service for users who prefer not to directly submit their vote proof to the Communication Layer using their own wallets. Instead, the backend server signs the proof with a wallet that contains funds and submits the transaction on behalf of the user. After submission, the server returns the transaction hash, allowing users to independently verify the transaction. This process ensures that users cannot be misled into thinking a transaction occurred when it did not.

Since this backend is centralized, the liveness of the service is relatively low. It's important to note that the entire ZKvot system does not depend on this backend to function. Even if the backend server experiences downtime or becomes unavailable, the system as a whole will continue to operate. The backend is a convenience layer, not a critical part of the core system.

To maintain full anonymity, it is recommended that users access the service through a decentralized VPN or similar privacy-enhancing technologies.
