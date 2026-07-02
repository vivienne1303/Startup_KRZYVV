const careerDnaColumns =
  "id, user_id, result_title, summary, strengths, interests, recommended_paths, answers, score, created_at, updated_at";

const listCareerDnaResults = async (client) => {
  const { data, error } = await client
    .from("career_dna_results")
    .select(careerDnaColumns)
    .order("created_at", { ascending: false });

  return { data, error };
};

const getCareerDnaResultById = async (client, id) => {
  const { data, error } = await client
    .from("career_dna_results")
    .select(careerDnaColumns)
    .eq("id", id)
    .single();

  return { data, error };
};

const createCareerDnaResult = async (client, payload, userId) => {
  const { data, error } = await client
    .from("career_dna_results")
    .insert({
      user_id: userId,
      result_title: payload.result_title,
      summary: payload.summary || null,
      strengths: payload.strengths || [],
      interests: payload.interests || [],
      recommended_paths: payload.recommended_paths || [],
      answers: payload.answers || {},
      score: payload.score || {},
    })
    .select(careerDnaColumns)
    .single();

  return { data, error };
};

const updateCareerDnaResult = async (client, id, payload) => {
  const allowedFields = [
    "result_title",
    "summary",
    "strengths",
    "interests",
    "recommended_paths",
    "answers",
    "score",
  ];
  const updates = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] = payload[field];
    }
  });

  const { data, error } = await client
    .from("career_dna_results")
    .update(updates)
    .eq("id", id)
    .select(careerDnaColumns)
    .single();

  return { data, error };
};

const deleteCareerDnaResult = async (client, id) => {
  const { error } = await client.from("career_dna_results").delete().eq("id", id);
  return { error };
};

module.exports = {
  createCareerDnaResult,
  deleteCareerDnaResult,
  getCareerDnaResultById,
  listCareerDnaResults,
  updateCareerDnaResult,
};
