# getModelUrl

Creates a short-lived download URL for the two private model files under
`models/beef-v1/`. Only the detector and freshness classifier filenames are
accepted, so the function cannot be used to retrieve arbitrary cloud files.

Deploy this function to the environment configured in `config/env.js`.
