import db from "../../../src/utils/db.js";
import getElectionDataByElectionId from "./getElectionDataByElectionId.js";
export default (data, callback) => {
    if (!data || typeof data !== "object")
        return callback("data_required");
    if (!data.election_id || typeof data.election_id !== "string" || !data.election_id.length)
        return callback("election_id_required");
    db.get(data.election_id, (err, value) => {
        if (err && err.code !== "LEVEL_NOT_FOUND")
            return callback(err);
        // if (!err || value)
        //   return callback(null);
        getElectionDataByElectionId({
            election_id: data.election_id,
            mina_rpc_url: data.mina_rpc_url,
        }, (err, election_data) => {
            if (err)
                return callback(err);
            db.put(data.election_id, election_data, (err) => {
                if (err)
                    return callback(err);
                return callback(null, election_data);
            });
        });
    });
};
//# sourceMappingURL=getAndSaveElectionDataByElectionIdIfNotExist.js.map