if (!document.querySelector('script[src*="auth-nav.js"]')) {
  import("./auth-nav.js");
}

const translations = {
  "TeenLaunch | Discover Opportunities. Build Your Future.": "TeenLaunch | 发现机会，打造未来。",
  "TeenLaunch | Opportunities": "TeenLaunch | 机会",
  "TeenLaunch | Competitions": "TeenLaunch | 比赛",
  "TeenLaunch | Debate Hub": "TeenLaunch | 辩论中心",
  "TeenLaunch | AI Assistant": "TeenLaunch | AI 助手",
  "Future founders start here": "未来创始人从这里开始",
  "Opportunity radar": "机会雷达",
  "Competition mode": "比赛模式",
  "Debate hub": "辩论中心",
  "AI learning co-pilot": "AI 学习伙伴",
  "Home": "首页",
  "Opportunities": "机会",
  "Competitions": "比赛",
  "Debate Hub": "辩论中心",
  "AI Assistant": "AI 助手",
  "For teenagers aged 10-24": "面向 10-24 岁青少年",
  "Discover Opportunities. Build Your Future.": "发现机会，打造未来。",
  "TeenLaunch is a youth-first startup platform for entrepreneurship, competitions, debate skills, leadership, and AI-powered learning.": "TeenLaunch 是一个以青少年为中心的创业平台，帮助你探索创业、比赛、辩论技能、领导力和 AI 学习。",
  "Get Started": "开始探索",
  "Explore Platform": "探索平台",
  "TeenLaunch AI": "TeenLaunch AI",
  "online": "在线",
  "What do you want to build this month?": "这个月你想打造什么？",
  "A pitch for a climate tech idea.": "一个气候科技创意的路演。",
  "Cool. I found 3 competitions, 2 mentors, and a pitch checklist.": "太好了。我找到了 3 个比赛、2 位导师和一份路演清单。",
  "Ask about ideas, debates, competitions...": "询问创意、辩论、比赛...",
  "Featured sections": "精选板块",
  "One launchpad for skills, courage, and real-world experience.": "一个提升技能、勇气和真实经验的起点。",
  "Startup Opportunities": "创业机会",
  "Programmes, internships, workshops, leadership camps, and youth entrepreneurship tracks.": "项目、实习、工作坊、领导力营和青少年创业路线。",
  "Upcoming Competitions": "即将开始的比赛",
  "Pitch battles, hackathons, debate tournaments, public speaking contests, and innovation challenges.": "路演对决、黑客松、辩论赛、演讲比赛和创新挑战。",
  "Debate Skills": "辩论技能",
  "Practice argument building, rebuttals, critical thinking, confidence, and stage presence.": "练习论点构建、反驳、批判性思维、自信和舞台表现。",
  "Get guided learning, opportunity matching, pitch feedback, and study support.": "获得学习指导、机会匹配、路演反馈和学习支持。",
  "Events & Workshops": "活动与工作坊",
  "Join bite-sized sessions on entrepreneurship, communication, leadership, and AI tools.": "参加创业、沟通、领导力和 AI 工具的短课。",
  "What users can do": "用户可以做什么",
  "Move from curious to confident with small weekly wins.": "通过每周的小进步，从好奇走向自信。",
  "Discover opportunities that match your age, interests, and goals.": "发现符合你年龄、兴趣和目标的机会。",
  "Learn new startup, leadership, debate, and AI skills.": "学习创业、领导力、辩论和 AI 技能。",
  "Join competitions and track registration deadlines.": "参加比赛并追踪报名截止日期。",
  "Improve confidence with speaking prompts and practice tools.": "通过演讲提示和练习工具提升自信。",
  "Connect with programmes that make your portfolio stronger.": "连接能增强作品集的项目。",
  "Why this platform": "为什么选择这个平台",
  "Built for teens who want useful, beginner-friendly access.": "为想要实用、适合新手资源的青少年而建。",
  "Easy access": "轻松获取",
  "No more digging through random links. Find youth-friendly programmes in one clean place.": "不用再翻找零散链接。在一个清晰的平台找到适合青少年的项目。",
  "Youth-focused": "专注青少年",
  "Designed around students, young founders, debaters, creators, and first-time builders.": "为学生、年轻创始人、辩手、创作者和初次实践者设计。",
  "Beginner-friendly": "新手友好",
  "Simple explanations, practical steps, and tools that help you start before you feel ready.": "简单解释、实用步骤和工具，帮助你在准备好之前就开始行动。",
  "Future-ready": "面向未来",
  "Learn entrepreneurship, communication, leadership, and AI skills that compound over time.": "学习创业、沟通、领导力和 AI 技能，让能力持续积累。",
  "Student stories": "学生故事",
  "Proof that young people can build early and build well.": "证明年轻人也能早早开始，并做得很好。",
  "\"TeenLaunch helped me turn a school idea into a competition pitch in two weeks.\"": "“TeenLaunch 帮我在两周内把学校创意变成了比赛路演。”",
  "Maya, 15": "Maya，15 岁",
  "Startup pitch finalist": "创业路演决赛选手",
  "\"The debate practice made me way calmer before my public speaking contest.\"": "“辩论练习让我在演讲比赛前冷静很多。”",
  "Jayden, 13": "Jayden，13 岁",
  "Public speaking winner": "演讲比赛获奖者",
  "\"I found a youth innovation workshop and met teammates for my first app idea.\"": "“我找到了青少年创新工作坊，也遇到了第一个 app 创意的队友。”",
  "Alyssa, 17": "Alyssa，17 岁",
  "Student founder": "学生创始人",
  "Future founders start here.": "未来创始人从这里开始。",
  "About": "关于",
  "Why TeenLaunch": "为什么选择 TeenLaunch",
  "Stories": "故事",
  "Contact": "联系",
  "Ask the AI assistant": "询问 AI 助手",
  "Social": "社交媒体",
  "Instagram": "Instagram",
  "TikTok": "TikTok",
  "LinkedIn": "LinkedIn",
  "Explore what is next": "探索下一步",
  "Find programmes, camps, workshops, and internships made for young builders.": "寻找为年轻实践者打造的项目、营地、工作坊和实习。",
  "Search youth-friendly entrepreneurship, leadership, technology, debate, and volunteering opportunities with deadlines and eligibility shown upfront.": "搜索适合青少年的创业、领导力、科技、辩论和志愿机会，并提前查看截止日期与资格。",
  "Recommended match": "推荐匹配",
  "Startup Sprint Camp": "创业冲刺营",
  "For ages 13-18. Build an MVP, meet mentors, and pitch on demo day.": "适合 13-18 岁。打造 MVP、认识导师，并在展示日进行路演。",
  "Browse Opportunities": "浏览机会",
  "Search": "搜索",
  "All": "全部",
  "Business": "商业",
  "Technology": "科技",
  "Debate/Public Speaking": "辩论/公众演讲",
  "Leadership": "领导力",
  "Volunteering": "志愿服务",
  "Young Founder Accelerator": "年轻创始人加速器",
  "Entrepreneurship programme for students building their first business idea.": "面向正在打造第一个商业创意的学生创业项目。",
  "Deadline: 28 Jun 2026": "截止日期：2026 年 6 月 28 日",
  "Eligibility: Ages 14-19": "资格：14-19 岁",
  "Apply": "申请",
  "AI Innovation Workshop": "AI 创新工作坊",
  "Hands-on sessions for using AI tools to research, prototype, and present ideas.": "动手学习如何用 AI 工具研究、原型制作和展示创意。",
  "Deadline: 12 Jul 2026": "截止日期：2026 年 7 月 12 日",
  "Eligibility: Ages 12-19": "资格：12-19 岁",
  "Future Leaders Camp": "未来领袖营",
  "A confidence-building camp focused on teamwork, decision-making, and service.": "专注团队合作、决策和服务的自信力训练营。",
  "Deadline: 5 Aug 2026": "截止日期：2026 年 8 月 5 日",
  "Eligibility: Ages 10-16": "资格：10-16 岁",
  "Public Speaking Lab": "公众演讲实验室",
  "Weekly practice sessions for speeches, debate arguments, and presentation skills.": "每周练习演讲、辩论论点和展示技能。",
  "Deadline: 22 Jul 2026": "截止日期：2026 年 7 月 22 日",
  "Eligibility: Ages 11-19": "资格：11-19 岁",
  "Community Impact Crew": "社区影响力团队",
  "Join youth-led volunteering projects and learn how social impact programmes run.": "加入青少年主导的志愿项目，学习社会影响力项目如何运作。",
  "Deadline: Rolling": "截止日期：滚动报名",
  "Eligibility: Ages 10-24": "资格：10-24 岁",
  "Student Tech Internship": "学生科技实习",
  "Beginner-friendly internship shadowing product, design, and startup operations teams.": "适合新手的实习，跟随产品、设计和创业运营团队学习。",
  "Deadline: 18 Aug 2026": "截止日期：2026 年 8 月 18 日",
  "Eligibility: Ages 16-19": "资格：16-19 岁",
  "No matching opportunities yet. Try another search or category.": "暂时没有匹配的机会。试试其他搜索词或类别。",
  "Recommended": "推荐",
  "Best first step": "最佳第一步",
  "Start with the AI Innovation Workshop if you want a practical, beginner-friendly way to connect tech and entrepreneurship.": "如果你想用实用又适合新手的方式连接科技与创业，可以从 AI 创新工作坊开始。",
  "Trending": "热门",
  "Most saved": "收藏最多",
  "Young Founder Accelerator is trending this month because it includes mentors, demo day, and portfolio-ready project outcomes.": "年轻创始人加速器本月很热门，因为它包含导师、展示日和可放入作品集的项目成果。",
  "Ask AI": "询问 AI",
  "Compete with confidence": "自信参赛",
  "Pitch, code, speak, debate, and show what you can build.": "路演、编程、演讲、辩论，展示你能打造什么。",
  "Track startup pitch competitions, hackathons, debate contests, public speaking events, and innovation challenges in one focused dashboard.": "在一个聚焦的面板追踪创业路演、黑客松、辩论赛、演讲活动和创新挑战。",
  "Next deadline": "下一个截止日期",
  "Loading...": "加载中...",
  "Youth Startup Pitch Challenge registration closes soon.": "青少年创业路演挑战报名即将截止。",
  "Competition cards": "比赛卡片",
  "Choose your arena.": "选择你的赛场。",
  "Startup Pitch": "创业路演",
  "Youth Startup Pitch Challenge": "青少年创业路演挑战",
  "Rules: 3-minute pitch, 2-minute Q&A, solo or teams up to 4.": "规则：3 分钟路演，2 分钟问答，可个人或最多 4 人组队。",
  "Timeline: Jul 1 briefing, Jul 20 finals": "时间线：7 月 1 日说明会，7 月 20 日决赛",
  "Prize pool: $5,000": "奖金池：$5,000",
  "Requirements: Ages 13-19, pitch deck": "要求：13-19 岁，提交路演稿",
  "Set Reminder": "设置提醒",
  "Hackathon": "黑客松",
  "48H AI Hack Sprint": "48 小时 AI 黑客冲刺",
  "Rules: Build a working prototype using AI for learning, health, or sustainability.": "规则：使用 AI 为学习、健康或可持续发展打造可运行原型。",
  "Timeline: Aug 9-11": "时间线：8 月 9-11 日",
  "Prize pool: $3,000": "奖金池：$3,000",
  "Requirements: Team of 2-5, demo video": "要求：2-5 人团队，提交演示视频",
  "Debate": "辩论",
  "Future Voices Debate Cup": "未来之声辩论杯",
  "Rules: Prepared and impromptu rounds using school-friendly debate motions.": "规则：使用适合学校的辩题进行准备赛和即兴赛。",
  "Timeline: Sep 5 qualifiers, Sep 19 finals": "时间线：9 月 5 日资格赛，9 月 19 日决赛",
  "Prize pool: Trophies and mentorship": "奖品：奖杯和导师指导",
  "Requirements: Ages 10-24, teams of 3": "要求：10-24 岁，3 人组队",
  "Upcoming events calendar": "即将到来的活动日历",
  "July to September": "7 月至 9 月",
  "Startup Pitch briefing": "创业路演说明会",
  "Pitch finals and demo day": "路演决赛与展示日",
  "AI Hack Sprint begins": "AI 黑客冲刺开始",
  "Debate Cup qualifiers": "辩论杯资格赛",
  "Reminders": "提醒",
  "Your list": "你的列表",
  "No reminders yet. Add one from a competition card.": "还没有提醒。可从比赛卡片添加一个。",
  "Past Winners Showcase": "往届获奖者展示",
  "2025 winners built a study app, a food waste tracker, and a youth mental wellness campaign.": "2025 年获奖者打造了学习 app、食物浪费追踪器和青少年心理健康活动。",
  "Preparation Tips": "准备技巧",
  "Read the judging rubric, rehearse under time pressure, and test your demo before submission day.": "阅读评分标准，在限时压力下排练，并在提交日前测试演示。",
  "Pitching Tips": "路演技巧",
  "Lead with the problem, show proof, keep the solution simple, and end with a clear ask.": "从问题切入，展示证据，保持方案简单，并以明确请求收尾。",
  "Presentation Advice": "展示建议",
  "Use fewer words on slides, speak slower than you think, and make eye contact during the strongest lines.": "幻灯片少放文字，说得比自己想象中更慢，并在关键句时进行眼神交流。",
  "Practice speaking": "练习演讲",
  "Speak. Think. Lead.": "表达。思考。领导。",
  "Build arguments, practice rebuttals, sharpen critical thinking, and grow into the kind of speaker people remember.": "构建论点、练习反驳、提升批判性思维，成长为让人记住的演讲者。",
  "Debate timer": "辩论计时器",
  "Speech minutes": "演讲分钟数",
  "Speaker round": "发言轮次",
  "Prime Minister": "正方一辩",
  "Opposition Leader": "反方一辩",
  "Rebuttal Speaker": "反驳发言人",
  "Reply Speech": "总结陈词",
  "Start": "开始",
  "Pause": "暂停",
  "Reset": "重置",
  "Practice mode ready.": "练习模式已准备。",
  "Learn the craft": "学习技巧",
  "Training blocks for stronger communication.": "提升沟通力的训练模块。",
  "Debate Basics": "辩论基础",
  "Learn roles, structures, motions, points of information, and speaker duties.": "学习角色、结构、辩题、质询点和发言职责。",
  "Argument Building": "论点构建",
  "Use claim, reason, evidence, impact, and link-back to make points land.": "使用主张、理由、证据、影响和回扣，让观点更有力。",
  "Rebuttal Techniques": "反驳技巧",
  "Spot weak assumptions, compare impacts, and respond without sounding defensive.": "识别薄弱假设，比较影响，并用不防御的方式回应。",
  "Public Speaking Tips": "公众演讲技巧",
  "Use pacing, pauses, posture, voice, and eye contact to sound confident.": "运用节奏、停顿、姿态、声音和眼神交流，听起来更自信。",
  "Critical Thinking Exercises": "批判性思维练习",
  "Practice weighing trade-offs, challenging assumptions, and ranking arguments.": "练习权衡取舍、挑战假设和排序论点。",
  "Practice area": "练习区",
  "This house believes schools should teach entrepreneurship.": "本院认为学校应该教授创业。",
  "Generate Random Motion": "生成随机辩题",
  "AI feedback mockup": "AI 反馈示例",
  "Try giving one clear example after your strongest argument.": "试着在最强论点后给出一个清晰例子。",
  "Your rebuttal is stronger when you compare impacts directly.": "当你直接比较影响时，反驳会更有力。",
  "Formats": "赛制",
  "British Parliamentary, World Schools, public forum, and classroom debate formats.": "英式议会制、世界学校制、公共论坛和课堂辩论赛制。",
  "Rules": "规则",
  "Speaker timing, protected time, POIs, judging criteria, and team roles.": "发言时间、保护时间、质询点、评判标准和团队角色。",
  "Sample Speeches": "示例演讲",
  "Study strong openings, rebuttal bridges, summary speeches, and reply speeches.": "学习有力开场、反驳衔接、总结发言和总结陈词。",
  "Winning Examples": "获胜案例",
  "Break down why winning speeches are persuasive, organized, and memorable.": "拆解获胜演讲为什么有说服力、有组织且令人难忘。",
  "Mini quiz": "小测验",
  "What should a strong argument include?": "一个有力论点应该包含什么？",
  "Claim, reasoning, evidence, impact": "主张、推理、证据、影响",
  "Only a loud voice": "只有响亮的声音",
  "A long quote with no explanation": "一段没有解释的长引用",
  "Progress tracking": "进度追踪",
  "Practice streak:": "连续练习：",
  "days": "天",
  "First Speech": "第一次演讲",
  "Rebuttal Rookie": "反驳新手",
  "3 Exercises Done": "完成 3 个练习",
  "Find competitions": "寻找比赛",
  "AI-powered learning": "AI 驱动学习",
  "Your startup, debate, and competition co-pilot.": "你的创业、辩论和比赛伙伴。",
  "Use the TeenLaunch AI assistant mockup to explore ideas, find opportunities, practice pitches, and get study-friendly guidance.": "使用 TeenLaunch AI 助手示例来探索创意、寻找机会、练习路演并获得适合学习的指导。",
  "mock chat": "聊天示例",
  "Hi. Ask me for startup ideas, pitch tips, debate feedback, or opportunity matches.": "你好。可以问我创业创意、路演技巧、辩论反馈或机会匹配。",
  "Send": "发送",
  "What it helps with": "它能帮什么",
  "Guided support without making things complicated.": "提供指导支持，但不把事情变复杂。",
  "Opportunity Matching": "机会匹配",
  "Find programmes based on age, topic, deadline, and confidence level.": "根据年龄、主题、截止日期和信心水平寻找项目。",
  "Pitch Feedback": "路演反馈",
  "Improve problem statements, slides, hooks, demo scripts, and final asks.": "改进问题陈述、幻灯片、开场钩子、演示脚本和最终请求。",
  "Debate Coaching": "辩论辅导",
  "Get structure ideas for arguments, rebuttals, motions, and speaking drills.": "获取论点、反驳、辩题和演讲练习的结构建议。",
  "Learning Plans": "学习计划",
  "Create weekly plans for entrepreneurship, leadership, competitions, and AI tools.": "制定创业、领导力、比赛和 AI 工具的每周计划。",
  "Prompt library": "提示词库",
  "Tap a starter prompt.": "点击一个起始提示。",
  "Find beginner startup opportunities for a 15-year-old.": "为 15 岁学生寻找新手创业机会。",
  "Give me a 60-second pitch structure.": "给我一个 60 秒路演结构。",
  "Generate a debate motion about AI in schools.": "生成一个关于学校中 AI 的辩题。",
  "Create a 7-day confidence practice plan.": "制定一个 7 天自信练习计划。",
  "Future-ready learning": "面向未来的学习",
  "Personalized tracks": "个性化路线",
  "Entrepreneurship": "创业",
  "Debate Skills": "辩论技能",
  "AI Tools": "AI 工具",
  "Find opportunities": "寻找机会",
  "Search internships, workshops, camps...": "搜索实习、工作坊、营地...",
  "Ask TeenLaunch AI...": "询问 TeenLaunch AI...",
  "This house would ban homework for students under 14.": "本院将禁止 14 岁以下学生做家庭作业。",
  "This house believes AI should be allowed in classrooms.": "本院认为课堂中应该允许使用 AI。",
  "This house would make public speaking a core school subject.": "本院将把公众演讲列为学校核心科目。",
  "This house believes teenagers should vote in local elections.": "本院认为青少年应该在地方选举中投票。",
  "This house would prioritize climate innovation over fast fashion.": "本院将优先发展气候创新，而不是快时尚。",
  "Correct. Strong arguments need structure and impact.": "正确。有力论点需要结构和影响。",
  "Try again. Judges need reasoning, proof, and impact.": "再试一次。评委需要推理、证据和影响。",
  "Time. Reset for another round.": "时间到。重置后开始下一轮。",
  "Paused. Breathe, then continue.": "已暂停。深呼吸，然后继续。",
  "Reminder Added": "已添加提醒",
  "Closed": "已截止",
  "Great. Start by choosing one problem, one audience, and one tiny test you can finish this week.": "很好。先选择一个问题、一个受众，以及一个本周能完成的小测试。",
  "Try this structure: hook, problem, solution, proof, impact, ask. Keep it under 60 seconds.": "试试这个结构：钩子、问题、方案、证据、影响、请求。控制在 60 秒内。",
  "For opportunities, filter by age, deadline, and topic. Beginner-friendly programmes are best for your first win.": "寻找机会时，可按年龄、截止日期和主题筛选。新手友好项目最适合拿下第一次成果。",
  "For debate practice, make one claim, explain why it matters, then compare your impact against the other side.": "练习辩论时，先提出一个主张，解释它为什么重要，再和对方比较影响。"
};

Object.assign(translations, {
  "Resources": "资源",
  "Soft Skills & Debate": "软技能与辩论",
  "AI Chatbot": "AI 聊天助手",
  "Academic": "学术类",
  "Non-Academic": "非学术类",
  "TeenLaunch | Soft Skills & Debate": "TeenLaunch | 软技能与辩论",
  "TeenLaunch | AI Chatbot": "TeenLaunch | AI 聊天助手",
  "Soft skills lab": "软技能训练室",
  "TeenLaunch Chatbot": "TeenLaunch 聊天助手",

  "TeenLaunch is a bilingual platform and community helping teenagers aged 10-24 discover opportunities in innovation, entrepreneurship, communication, and personal development.": "TeenLaunch 是一个双语平台与社区，帮助 10 至 24 岁青少年探索创新、创业、沟通和个人发展机会。",
  "What kind of opportunity are you looking for?": "你正在寻找什么类型的机会？",
  "Beginner startup programmes for a 15-year-old.": "适合 15 岁学生的入门创业项目。",
  "I found startup camps, pitch competitions, and a workshop with July deadlines.": "我找到了创业营、路演比赛，以及 7 月截止报名的工作坊。",
  "Ask about opportunities, skills, competitions...": "询问机会、技能、比赛...",

  "The problem": "问题",
  "Many teenagers do not know where to find growth opportunities beyond academics.": "许多青少年不知道在哪里寻找学业之外的成长机会。",
  "Opportunities such as startup programmes, competitions, leadership workshops, debate platforms, MUN, internships, job shadowing, and skill-development resources are scattered across different places.": "创业项目、比赛、领导力工作坊、辩论平台、模拟联合国、实习、职场体验和技能发展资源分散在不同地方。",
  "Opportunities such as startup initiatives, competitions, leadership workshops, debate platforms, internships, and skill-building resources exist, but they are often difficult to find.": "创业计划、比赛、领导力工作坊、辩论平台、实习和技能培养资源虽然存在，但往往难以找到。",
  "Information is poorly organised and not always communicated clearly to students, so many teenagers miss valuable chances to grow.": "相关信息通常整理不清，也未必能清楚传达给学生，因此许多青少年错过宝贵的成长机会。",
  "Because information is hard to find, teenagers may miss valuable chances to build future-ready skills and explore career pathways early.": "由于信息难以寻找，青少年可能会错过培养未来技能和提早探索职业路径的宝贵机会。",
  "Many students lack confidence in soft skills such as communication, critical thinking, articulation, negotiation, and problem solving.": "许多学生在沟通、批判性思维、表达、谈判和解决问题等软技能方面缺乏信心。",
  "Youths interested in internships, debate, MUN, entrepreneurship, and innovation-driven industries often need clearer guidance and support.": "对实习、辩论、模拟联合国、创业和创新型行业感兴趣的青少年，往往需要更清晰的指导与支持。",
  "Without early exposure, youths may not explore their full potential or prepare for future career pathways and innovation-driven industries.": "如果缺乏早期接触与支持，青少年可能无法充分探索自身潜力，也难以为未来职业路径和创新型行业做好准备。",

  "Our solution": "我们的解决方案",
  "A bilingual youth-focused platform that brings everything together in one place.": "一个面向青少年的双语平台，把所有资源集中在一个地方。",
  "Information about internship, job shadowing, and work opportunities.": "提供实习、职场体验和工作机会相关信息。",
  "Clear context for programmes, competitions, leadership workshops, and entrepreneurship experiences.": "清楚介绍项目、比赛、领导力工作坊和创业体验的背景与内容。",
  "Resources for career exploration, future development, innovation, and entrepreneurship.": "提供职业探索、未来发展、创新和创业相关资源。",
  "Debate, negotiation, communication, and soft-skill development tools.": "提供辩论、谈判、沟通和软技能发展工具。",
  "A safe and supportive community where teenagers can learn, collaborate, and grow.": "建立一个安全且支持性的社区，让青少年能够学习、合作和成长。",
  "AI chatbot assistance to help users find opportunities, competitions, resources, and learning materials faster.": "通过 AI 聊天助手，帮助用户更快找到机会、比赛、资源和学习材料。",

  "Purpose, goals, and vision": "宗旨、目标与愿景",
  "Bridge the gap between education and real-world opportunities.": "连接教育与真实世界机会之间的距离。",
  "Our Purpose": "我们的宗旨",
  "Help teenagers discover and access competitions, programmes, internships, and entrepreneurial experiences while encouraging active learning, innovation, and personal growth.": "帮助青少年发现并参与比赛、项目、实习和创业体验，同时鼓励主动学习、创新和个人成长。",
  "Our Goals": "我们的目标",
  "Increase awareness of youth opportunities, develop critical thinking, communication, leadership, and problem-solving skills, and provide resources, guidance, and community support.": "提高青少年对机会的认识，培养批判性思维、沟通、领导力和解决问题能力，并提供资源、指导和社区支持。",
  "Our Vision": "我们的愿景",
  "Empower teenagers to become confident, future-ready individuals who take initiative, pursue their passions, and create meaningful impact.": "赋能青少年成为自信、面向未来的人，主动行动、追求热情，并创造有意义的影响。",

  "Platform highlights": "平台亮点",
  "A clear launchpad for opportunity discovery and teenage growth.": "一个帮助青少年发现机会并成长的清晰起点。",
  "Academic Competitions": "学术类比赛",
  "Non-Academic Competitions": "非学术类比赛",
  "Startup programmes, leadership camps, innovation workshops, internships, and youth entrepreneurship tracks.": "创业项目、领导力营、创新工作坊、实习和青少年创业路线。",
  "Language, mathematics, science, and humanities competitions with rules, prizes, and registration links.": "语言、数学、科学和人文类比赛，并提供规则、奖项和报名链接。",
  "Startup pitches, debate, public speaking, and innovation challenges for confident builders.": "面向自信实践者的创业路演、辩论、公众演讲和创新挑战。",
  "Workshops, events, showcases, pitching tips, presentation advice, and inspiration.": "工作坊、活动、展示、路演技巧、演示建议和灵感内容。",
  "Debate basics, public speaking, critical thinking, practice tools, feedback, and badges.": "辩论基础、公众演讲、批判性思维、练习工具、反馈和技能徽章。",

  "Move from curious to capable with practical next steps.": "通过实际行动，从好奇走向有能力。",
  "Develop critical thinking, articulation, negotiation, problem solving, and leadership skills.": "培养批判性思维、表达、谈判、解决问题和领导力技能。",
  "No more digging through random links. Find internships, job shadowing, competitions, programmes, and learning resources in one clean place.": "不再需要翻找零散链接。在一个清晰的平台找到实习、职场体验、比赛、项目和学习资源。",
  "Designed around students aged 10-24 who want clear, age-appropriate, bilingual guidance and community support.": "专为 10 至 24 岁学生设计，提供清晰、适龄、双语的指导和社区支持。",
  "Find one opportunity, practise one skill, and take one confident step this week.": "本周找到一个机会，练习一项技能，并迈出自信的一步。",
  "Search opportunities by age, deadline, mode, and experience level.": "按年龄、截止日期、形式和经验水平筛选机会。",
  "Explore competitions with rules, timelines, prizes, and registration links.": "探索包含规则、时间线、奖项和报名链接的比赛。",
  "Use the AI chatbot to find resources and plan what to do next.": "使用 AI 聊天助手寻找资源并规划下一步。",
  "Mobile app": "移动应用",
  "Mobile app coming soon": "移动应用即将推出",
  "TeenLaunch is getting a pocket-sized home for opportunities, reminders, resources, and AI guidance.": "TeenLaunch 即将推出一个随身应用，帮助你查看机会、提醒、资源和 AI 指导。",
  "iOS": "iOS",
  "Android": "Android",
  "TeenLaunch | Settings": "TeenLaunch | 设置",
  "TeenLaunch | Display Settings": "TeenLaunch | 显示设置",
  "Settings": "设置",
  "Personalise your TeenLaunch experience.": "个性化你的 TeenLaunch 体验。",
  "Display Settings": "显示设置",
  "Choose between the current blue light mode and the original dark purple mode.": "在当前蓝色浅色模式和原始深紫色模式之间选择。",
  "Choose how TeenLaunch looks.": "选择 TeenLaunch 的外观。",
  "Light Mode": "浅色模式",
  "Dark Mode": "深色模式",
  "Use the current bright blue colour scheme.": "使用当前明亮的蓝色配色。",
  "Use the original dark purple colour scheme.": "使用原始的深紫色配色。",
  "Back to Settings": "返回设置",

  "Find youth opportunities that match your next step.": "寻找适合你下一步的青少年机会。",
  "Search youth-friendly opportunities with categories, age groups, deadlines, delivery mode, and beginner or advanced levels shown upfront.": "搜索适合青少年的机会，并清楚查看类别、年龄组、截止日期、参与形式和难度等级。",
  "All ages": "所有年龄",
  "Ages 10-13": "10-13 岁",
  "Ages 14-16": "14-16 岁",
  "Ages 17-19": "17-19 岁",
  "Online": "线上",
  "Physical": "线下",
  "Beginner": "入门",
  "Advanced": "进阶",
  "Deadline soon": "即将截止",
  "Startup Programmes": "创业项目",
  "Leadership Camps": "领导力营",
  "Innovation Workshops": "创新工作坊",
  "Internships": "实习",
  "Youth Entrepreneurship": "青少年创业",
  "Recommended Opportunities": "推荐机会",
  "Trending Opportunities": "热门机会",

  "Competition calendar": "比赛日历",
  "Track academic and non-academic competitions without missing deadlines.": "追踪学术类与非学术类比赛，不错过截止日期。",
  "Find language, mathematics, science, humanities, startup pitch, debate, public speaking, and innovation challenges with rules and registration links.": "寻找语言、数学、科学、人文、创业路演、辩论、公众演讲和创新挑战，并查看规则与报名链接。",
  "Competitions (Academic)": "学术类比赛",
  "Competitions (Non-Academic)": "非学术类比赛",
  "Language": "语言",
  "Mathematics": "数学",
  "Science": "科学",
  "Humanities": "人文",

  "Ask for opportunities, competitions, resources, and learning materials.": "询问机会、比赛、资源和学习材料。",
  "Use the TeenLaunch chatbot mockup to explore ideas, compare deadlines, practise pitches, and get student-friendly guidance.": "使用 TeenLaunch 聊天助手探索想法、比较截止日期、练习路演，并获得适合学生的指导。",
  "Learning Materials": "学习材料",
  "Find guides, checklists, workshop notes, debate resources, and pitch practice material.": "寻找指南、清单、工作坊笔记、辩论资源和路演练习材料。"
});

Object.assign(translations, {
  "My Profile": "我的个人资料", "Logout": "退出登录", "Applications": "申请", "Followers": "关注者", "Following": "关注中",
  "Edit Profile": "编辑个人资料", "Applied": "已申请", "Saved": "已收藏", "Applied Opportunities": "已申请的机会",
  "Saved Opportunities": "已收藏的机会", "You have not applied for any opportunities yet.": "你还没有申请任何机会。",
  "You have not saved any opportunities yet.": "你还没有收藏任何机会。", "Full name": "姓名", "Bio": "个人简介",
  "School": "学校", "Education level": "教育程度", "View Details": "查看详情", "Remove": "移除", "Pending": "待处理",
  "Loading your profile...": "正在加载你的个人资料……", "Your profile could not be loaded.": "无法加载你的个人资料。",
  "Try Again": "重试", "TeenLaunch user": "TeenLaunch 用户", "No bio yet.": "还没有个人简介。",
  "Resources": "资源", "Soft Skills & Debate": "软技能与辩论", "AI Chatbot": "AI 聊天助手", "Settings": "设置",
  "Academic": "学术类", "Non-Academic": "非学术类", "Login": "登录", "Submit application": "提交申请",
  "Application form": "申请表", "Email": "电子邮箱", "Phone number": "电话号码", "Date of birth": "出生日期",
  "School name": "学校名称", "Current education level": "目前教育程度", "Optional": "选填", "Why are you interested?": "你为什么感兴趣？",
  "Relevant skills or experience": "相关技能或经验", "Additional comments": "其他说明", "Back to opportunities": "返回机会页面"
});

Object.assign(translations, {
  "TeenLaunch | Admin Dashboard": "TeenLaunch | 管理员控制台",
  "TeenLaunch | Edit Profile": "TeenLaunch | 编辑个人资料",
  "Admin control centre": "管理员控制中心",
  "Admin Dashboard": "管理员控制台",
  "Platform overview": "平台概览",
  "Manage users, applications, opportunities, and Career DNA activity.": "管理用户、申请、机会和职业 DNA 活动。",
  "Registered users": "注册用户",
  "Published opportunities": "已发布的机会",
  "Applications submitted": "已提交的申请",
  "Career DNA submissions": "职业 DNA 提交记录",
  "Refresh dashboard": "刷新控制台",
  "View Applications": "查看申请",
  "View Career DNA Results": "查看职业 DNA 结果",
  "Add opportunity": "添加机会",
  "Edit opportunity": "编辑机会",
  "Create a published opportunity for users": "为用户创建并发布机会",
  "Category": "类别",
  "Select category": "选择类别",
  "Title": "标题",
  "Description": "描述",
  "Deadline": "截止日期",
  "Start date": "开始日期",
  "End date": "结束日期",
  "Mode": "形式",
  "Select mode": "选择形式",
  "Minimum age": "最低年龄",
  "Maximum age": "最高年龄",
  "Level": "级别",
  "Select level": "选择级别",
  "All levels": "所有级别",
  "Organizer": "主办方",
  "Location": "地点",
  "Application URL": "申请网址",
  "Publish immediately": "立即发布",
  "Add Opportunity": "添加机会",
  "Save Changes": "保存更改",
  "Clear": "清除",
  "Published!": "已发布！",
  "Saved as draft!": "已保存为草稿！",
  "Changes saved!": "更改已保存！",
  "User list": "用户列表",
  "Career DNA results": "职业 DNA 结果",
  "Career DNA result": "职业 DNA 结果",
  "No users found.": "未找到用户。",
  "No registrations yet.": "暂无申请。",
  "No Career DNA submissions yet.": "暂无职业 DNA 提交记录。",
  "Edit": "编辑",
  "Delete": "删除",
  "Delete opportunity": "删除机会",
  "Delete failed": "删除失败",
  "This cannot be undone.": "此操作无法撤销。",
  "The opportunity could not be deleted. Please try again.": "无法删除该机会，请重试。",
  "Edit picture": "编辑头像",
  "JPG, PNG or WebP, up to 1 MB.": "支持 JPG、PNG 或 WebP，最大 1 MB。",
  "Username": "用户名",
  "Age": "年龄",
  "Country": "国家/地区",
  "Portfolio URL": "作品集网址",
  "Save changes": "保存更改",
  "Cancel": "取消",
  "Career DNA complete! Please fill in the highlighted profile details so we can personalise your opportunities.": "职业 DNA 测试已完成！请填写高亮显示的个人资料，以便我们为你推荐合适的机会。",
  "Career DNA complete! Your profile is already up to date. Save to view your results.": "职业 DNA 测试已完成！你的个人资料已经是最新的。保存后即可查看结果。",
  "Creator": "创作者",
  "Builder": "实践者",
  "Explorer": "探索者",
  "Connector": "连接者",
  "Leader": "领导者",
  "Top strength": "首要优势",
  "Second strength": "第二优势"
  ,"TeenLaunch | Career DNA Test": "TeenLaunch | 职业 DNA 测试"
  ,"TeenLaunch | Career DNA Result": "TeenLaunch | 职业 DNA 结果"
  ,"Discover your strengths": "发现你的优势"
  ,"Career DNA Test": "职业 DNA 测试"
  ,"Choose the answer that feels most like you. There are no wrong answers.": "选择最符合你的答案，没有正确或错误之分。"
  ,"Select one answer": "选择一个答案"
  ,"Previous": "上一题"
  ,"Restart Test": "重新开始测试"
  ,"Next": "下一题"
  ,"Submit Test": "提交测试"
  ,"Confirming your session...": "正在确认你的登录状态……"
  ,"Strongly disagree": "非常不同意"
  ,"Disagree": "不同意"
  ,"Neutral": "一般"
  ,"Agree": "同意"
  ,"Strongly agree": "非常同意"
  ,"Your Career DNA": "你的职业 DNA"
  ,"Loading your Career DNA...": "正在加载你的职业 DNA……"
  ,"Recommended job families": "推荐职业领域"
  ,"Opportunity types": "机会类型"
  ,"Explore opportunities": "探索机会"
  ,"Retake Career DNA Test": "重新进行职业 DNA 测试"
  ,"We could not load your result.": "无法加载你的结果。"
  ,"Try again": "重试"
  ,"I enjoy turning my ideas into videos, designs, stories or presentations.": "我喜欢把想法转化为视频、设计、故事或演示文稿。"
  ,"I often notice how the appearance or message of something could be improved.": "我经常能发现事物的外观或表达方式可以如何改进。"
  ,"I enjoy figuring out how apps, machines or technology work.": "我喜欢研究应用程序、机器或技术的运作方式。"
  ,"I prefer learning by building, testing or trying something myself.": "我更喜欢通过亲自制作、测试或尝试来学习。"
  ,"I like researching a topic and comparing information before making a decision.": "我喜欢先研究主题并比较资料，再作出决定。"
  ,"I enjoy finding patterns and understanding why something happened.": "我喜欢寻找规律并理解事情发生的原因。"
  ,"I feel satisfied when I help someone learn or solve a problem.": "帮助别人学习或解决问题会让我感到满足。"
  ,"I enjoy working with different people and listening to their ideas.": "我喜欢与不同的人合作并聆听他们的想法。"
  ,"I naturally take charge when a group is unsure what to do next.": "当团队不确定下一步该做什么时，我会自然地主动带领大家。"
  ,"I enjoy presenting my ideas and encouraging others to support them.": "我喜欢表达自己的想法，并鼓励他人支持这些想法。"
  ,"Please answer all 10 questions before submitting.": "请回答全部 10 道题后再提交。"
  ,"Choose an answer before continuing.": "请选择一个答案后再继续。"
  ,"Saving your Career DNA result...": "正在保存你的职业 DNA 结果……"
  ,"Your Career DNA highlights the ways you naturally create, solve and lead.": "你的职业 DNA 展现了你自然进行创造、解决问题和领导他人的方式。"
  ,"(optional)": "（选填）"
  ,"your.username": "你的用户名"
  ,"https://your-portfolio.com": "https://你的作品集网址"
  ,"Loading admin dashboard...": "正在加载管理员控制台……"
  ,"Checking admin access...": "正在检查管理员权限……"
  ,"Adding opportunity...": "正在添加机会……"
  ,"Application status updated.": "申请状态已更新。"
  ,"Access denied. Admin account required.": "拒绝访问，需要管理员账号。"
  ,"Minimum age cannot be higher than maximum age.": "最低年龄不能高于最高年龄。"
  ,"Loading your profile...": "正在加载你的个人资料……"
  ,"Saving your profile...": "正在保存你的个人资料……"
  ,"Profile saved successfully.": "个人资料保存成功。"
  ,"Picture ready. Save changes to update your profile.": "头像已准备好，请保存更改以更新个人资料。"
  ,"Age must be a whole number between 10 and 19.": "年龄必须是 10 至 19 之间的整数。"
  ,"Choose a JPG, PNG or WebP image no larger than 1 MB.": "请选择不超过 1 MB 的 JPG、PNG 或 WebP 图片。"
  ,"Startup Basics Cohort": "创业基础班"
  ,"A guided online programme covering ideation, customer research, simple finance, and pitching.": "涵盖创意构思、客户调研、基础财务和路演的线上指导课程。"
  ,"Singapore or Online": "新加坡或线上"
  ,"Personality Test": "性格测试"
  ,"View your Career DNA result or choose to retake the test.": "查看你的职业 DNA 结果，或选择重新进行测试。"
  ,"View and update your TeenLaunch profile details.": "查看并更新你的 TeenLaunch 个人资料。"
  ,"TeenLaunch | Recommended Opportunities": "TeenLaunch | 推荐机会"
  ,"TeenLaunch | Opportunity Details": "TeenLaunch | 机会详情"
  ,"Recommended for You": "为你推荐"
  ,"Career DNA matches": "职业 DNA 匹配"
  ,"Rule-based recommendations using your Career DNA strengths and eligibility details.": "根据你的职业 DNA 优势和资格资料生成的规则匹配推荐。"
  ,"Finding your best matches...": "正在寻找最适合你的机会……"
  ,"Comparing your latest Career DNA result with active opportunities.": "正在将你最新的职业 DNA 结果与有效机会进行比较。"
  ,"Complete your Career DNA Test to unlock personalised recommendations.": "完成职业 DNA 测试以解锁个性化推荐。"
  ,"Take the Career DNA Test": "进行职业 DNA 测试"
  ,"No personalised matches are available yet.": "目前暂无个性化匹配。"
  ,"Check back when new opportunities are published.": "发布新机会后请再回来查看。"
  ,"Browse all opportunities": "浏览所有机会"
  ,"We could not load your recommendations.": "无法加载你的推荐。"
  ,"View all recommendations": "查看所有推荐"
  ,"Loading personalised recommendations...": "正在加载个性化推荐……"
  ,"Details": "详情"
  ,"View details": "查看详情"
  ,"Opportunity unavailable": "机会不可用"
  ,"Age eligibility": "年龄资格"
  ,"Education eligibility": "教育资格"
  ,"Format and location": "形式和地点"
  ,"Skills": "技能"
  ,"Save opportunity": "收藏机会"
  ,"Official application page": "官方申请页面"
  ,"Select one or more": "选择一个或多个"
  ,"Separate skills with commas": "使用逗号分隔技能"
  ,"Select all that apply": "选择所有适用项"
  ,"Status": "状态"
  ,"Active": "有效"
  ,"Inactive": "无效"
  ,"Draft": "草稿"
  ,"Archived": "已归档"
  ,"Image URL": "图片网址"
  ,"Communication, pitching, teamwork": "沟通、路演、团队合作"
  ,"Your session has expired.": "你的登录状态已过期。"
  ,"Log in again to view recommendations.": "重新登录以查看推荐。"
  ,"All Opportunities": "所有机会"
});

const translate = (key, language) => {
  if (language !== "zh") return key;
  return translations[key] || key;
};

const i18nElements = Array.from(document.querySelectorAll("[data-i18n]"));
const i18nAttributeElements = Array.from(document.querySelectorAll("[data-i18n-placeholder], [data-i18n-aria-label]"));
let languageToggle = document.querySelector("[data-language-toggle]");
if (!languageToggle) {
  languageToggle = document.createElement("button");
  languageToggle.type = "button";
  languageToggle.className = "language-toggle floating-language-toggle";
  languageToggle.dataset.languageToggle = "";
  languageToggle.setAttribute("aria-label", "Switch language");
  document.body.appendChild(languageToggle);
}
const pageTitle = document.title;
const originalText = new WeakMap();

const translateTextNodes = (root, language) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.parentElement?.closest("script,style,[data-i18n]") || !node.nodeValue.trim()) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const original = originalText.get(node), key = original.trim(), result = translate(key, language);
    if (result !== key || language === "en") node.nodeValue = original.replace(key, result);
  });
};

let currentLanguage = localStorage.getItem("teenlaunch-language") || "en";

const applyLanguage = (language) => {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = translate(pageTitle, language);

  i18nElements.forEach((element) => {
    element.textContent = translate(element.dataset.i18n, language);
  });

  i18nAttributeElements.forEach((element) => {
    if (element.dataset.i18nPlaceholder) {
      element.placeholder = translate(element.dataset.i18nPlaceholder, language);
    }

    if (element.dataset.i18nAriaLabel) {
      element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel, language));
    }
  });

  if (languageToggle) {
    languageToggle.textContent = language === "zh" ? "EN" : "中文";
    languageToggle.setAttribute("aria-label", language === "zh" ? "Switch to English" : "Switch to Chinese");
  }
  translateTextNodes(document.body, language);
};

const setLanguage = (language) => {
  currentLanguage = language;
  localStorage.setItem("teenlaunch-language", language);
  applyLanguage(language);
};

languageToggle?.addEventListener("click", () => {
  setLanguage(currentLanguage === "zh" ? "en" : "zh");
});

window.TeenLaunchI18n = {
  getLanguage: () => currentLanguage,
  setLanguage,
  translate: (key) => translate(key, currentLanguage)
};

applyLanguage(currentLanguage);

new MutationObserver((mutations) => {
  mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) translateTextNodes(node, currentLanguage);
    if (node.nodeType === Node.TEXT_NODE && node.parentElement) translateTextNodes(node.parentElement, currentLanguage);
  }));
}).observe(document.body, { childList: true, subtree: true });
