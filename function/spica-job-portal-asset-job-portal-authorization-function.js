import * as Identity from "@spica-devkit/identity";
import * as Bucket from "@spica-devkit/bucket";


const IDENTITIY_SECRET_KEY = process.env.IDENTITIY_SECRET_KEY;
const SECRET_API_KEY = process.env.SECRET_API_KEY;
const USER_BUCKET_ID = process.env.USER_BUCKET_ID;

Bucket.initialize({ apikey: SECRET_API_KEY });
Identity.initialize({ apikey: IDENTITIY_SECRET_KEY });

export async function register(req, res) {
    let { user_data } = req.body;
    console.log("userdata :", user_data)
    console.log("registiration start with this parameter : ", user_data);

    if (user_data.email && user_data.password) {
        let identity = await Identity.insert({
            identifier: user_data.email,
            password: user_data.password,
            policies: ["IdentityReadOnlyAccess", "BucketFullAccess"] // --custom
        }).catch(err => {
            console.log(err);
            return err;
        });

        if (identity._id) {
            let user = await Bucket.data.insert(USER_BUCKET_ID, {
                ...user_data,
                identity: identity._id,
            });
            return res.status(200).send({ message: "Registration successful", data: user._id });
        } else {
            return res.status(400).send({ message: identity.message });
        }
    }
    return res.status(400).send({ message: "Invalid email or password provided" });
}