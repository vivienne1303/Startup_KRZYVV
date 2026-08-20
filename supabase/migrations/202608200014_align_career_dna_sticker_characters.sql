-- Align historical Career DNA profile titles with the six characters printed
-- on the official TeenLaunch Career DNA sticker sheet.
update public.career_dna_results
set
  result_title = case result_title
    when 'Creative Initiator' then 'Future Founder'
    when 'Community Storyteller' then 'Creative Thinker'
    when 'Imaginative Researcher' then 'Creative Thinker'
    when 'Digital Maker' then 'Builder'
    when 'Technical Investigator' then 'Problem Solver'
    when 'Innovation Driver' then 'Future Founder'
    when 'Practical Supporter' then 'Builder'
    when 'Strategic Visionary' then 'Future Founder'
    when 'Insightful Guide' then 'Explorer'
    when 'Community Champion' then 'Pitch Ready'
    else result_title
  end,
  score = coalesce(score, '{}'::jsonb) || jsonb_build_object(
    'profile_name', case result_title
      when 'Creative Initiator' then 'Future Founder'
      when 'Community Storyteller' then 'Creative Thinker'
      when 'Imaginative Researcher' then 'Creative Thinker'
      when 'Digital Maker' then 'Builder'
      when 'Technical Investigator' then 'Problem Solver'
      when 'Innovation Driver' then 'Future Founder'
      when 'Practical Supporter' then 'Builder'
      when 'Strategic Visionary' then 'Future Founder'
      when 'Insightful Guide' then 'Explorer'
      when 'Community Champion' then 'Pitch Ready'
      else result_title
    end,
    'sticker_character', case result_title
      when 'Creative Initiator' then 'Future Founder'
      when 'Community Storyteller' then 'Creative Thinker'
      when 'Imaginative Researcher' then 'Creative Thinker'
      when 'Digital Maker' then 'Builder'
      when 'Technical Investigator' then 'Problem Solver'
      when 'Innovation Driver' then 'Future Founder'
      when 'Practical Supporter' then 'Builder'
      when 'Strategic Visionary' then 'Future Founder'
      when 'Insightful Guide' then 'Explorer'
      when 'Community Champion' then 'Pitch Ready'
      else result_title
    end,
    'test_version', '2.0'
  )
where result_title in (
  'Creative Initiator', 'Community Storyteller', 'Imaginative Researcher',
  'Digital Maker', 'Technical Investigator', 'Innovation Driver',
  'Practical Supporter', 'Strategic Visionary', 'Insightful Guide',
  'Community Champion'
);
