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
  "Help & Q&A": "帮助与常见问题",
  "User manual (PDF)": "用户手册（PDF）",
  "Social channels coming soon": "社交媒体频道即将上线",
  "Support": "支持",
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
  ,"Submit an Opportunity": "提交机会"
  ,"Loading verified opportunities...": "正在加载已验证的机会……"
  ,"No verified opportunities are open right now. Please check again soon.": "目前没有开放的已验证机会，请稍后再来查看。"
  ,"Verified opportunities could not be loaded.": "无法加载已验证的机会。"
  ,"Verified opportunities could not be loaded right now.": "目前无法加载已验证的机会。"
  ,"Try again": "重试"
});

Object.assign(translations, {
  "Career Copilot": "职业助手",
  "Life Planner": "生活规划器",
  "Mobile App": "手机应用",
  "My Profile": "我的个人主页",
  "My Portfolio": "我的作品集",
  "Logout": "退出登录",
  "Settings": "设置",
  "MY TIER": "我的等级",
  "Rewards journey": "奖励历程",
  "Level up. Unlock more.": "升级并解锁更多奖励。",
  "Challenger": "挑战者",
  "Achiever": "成就者",
  "Trailblazer": "开拓者",
  "Starter profile badge": "新手个人主页徽章",
  "One streak freeze": "一次连续记录保护",
  "Workshop priority access": "工作坊优先参与权",
  "Portfolio review": "作品集评审",
  "Mentor office hour": "导师交流时段",
  "Experiences": "经历",
  "My experiences": "我的经历",
  "Your visual diary of events, projects and growth.": "记录活动、项目与成长的视觉日记。",
  "＋ Add experience": "＋ 添加经历",
  "+ Add experience": "+ 添加经历",
  "Event or experience": "活动或经历",
  "Date": "日期",
  "Caption": "说明文字",
  "Photo": "照片",
  "Share experience": "分享经历",
  "Cancel": "取消",
  "Your experience story starts here.": "你的成长故事从这里开始。",
  "Add your first experience": "添加你的第一段经历",
  "day streak": "天连续记录",
  "days streak": "天连续记录",
  "Edit portfolio": "编辑作品集",
  "Print / Save as PDF": "打印／保存为 PDF",
  "Copy public link": "复制公开链接",
  "Help & User Manual": "帮助与用户手册",
  "Your future, in your pocket": "把未来装进口袋",
  "Find your next": "寻找你的下一个",
  "big opportunity.": "重大机会。",
  "Explore the app": "探索应用",
  "Join the waitlist": "加入候补名单",
  "Get early access": "抢先体验"
  ,"Account": "账户"
  ,"Edit your profile and open your portfolio.": "编辑个人资料并打开你的作品集。"
  ,"Back to Settings": "返回设置"
  ,"Find People": "寻找伙伴"
  ,"Inbox": "收件箱"
  ,"A mobile launchpad that helps young people discover, prepare for and capture opportunities that shape their future.": "一个帮助年轻人发现、准备并记录塑造未来机会的移动平台。"
  ,"Built with students,": "与学生共同打造，"
  ,"for students aged 10–24": "服务 10–24 岁学生"
  ,"Deadline reminder": "截止日期提醒"
  ,"3 days left": "还剩 3 天"
  ,"Great match": "高度匹配"
  ,"For your goals": "符合你的目标"
  ,"Good morning,": "早上好，"
  ,"Hey, Jennie!": "你好，Jennie！"
  ,"Your weekly momentum": "你的每周进度"
  ,"3 of 4 goals complete": "已完成 4 个目标中的 3 个"
  ,"Picked for you": "为你精选"
  ,"See all": "查看全部"
  ,"FEATURED": "精选"
  ,"INNOVATION": "创新"
  ,"Young Founders": "青年创办者"
  ,"Challenge 2026": "挑战赛 2026"
  ,"Singapore · Ages 14–18": "新加坡 · 14–18 岁"
  ,"94% match": "94% 匹配"
  ,"Explore by interest": "按兴趣探索"
  ,"Startup": "创业"
  ,"Speaking": "演讲"
  ,"Innovation": "创新"
  ,"Discover": "发现"
  ,"AI Guide": "AI 指南"
  ,"Portfolio": "作品集"
  ,"One journey, all in one place": "一段旅程，尽在一处"
  ,"From “what’s next?”": "从“下一步是什么？”"
  ,"to": "到"
  ,"“I did it.”": "“我做到了。”"
  ,"TeenLaunch turns scattered information into a clear, personal path forward.": "TeenLaunch 将零散信息整理成清晰、个性化的前进路径。"
  ,"DISCOVER": "发现"
  ,"Matches made": "为你的理想"
  ,"for your ambition.": "精准匹配。"
  ,"Smart recommendations based on your age, interests and goals—not an endless list of links.": "根据你的年龄、兴趣和目标提供智能推荐，而不是无尽的链接列表。"
  ,"Personal match score": "个人匹配分数"
  ,"Clear eligibility at a glance": "资格条件一目了然"
  ,"Deadline reminders": "截止日期提醒"
  ,"Search opportunities": "搜索机会"
  ,"For you": "为你推荐"
  ,"Internships": "实习"
  ,"24 opportunities matched": "已匹配 24 个机会"
  ,"PREPARE": "准备"
  ,"An AI guide that": "了解你下一步的"
  ,"knows your next step.": "AI 指南。"
  ,"Get plain-language answers, application help and confidence-building guidance whenever you need it.": "随时获得易懂的解答、申请帮助和增强自信的指导。"
  ,"PROVE YOUR GROWTH": "证明你的成长"
  ,"Every experience": "每一段经历"
  ,"becomes": "都成为"
  ,"evidence.": "成长证明。"
  ,"Be first to experience TeenLaunch on mobile.": "抢先体验 TeenLaunch 手机版。"
  ,"One app.": "一个应用。"
  ,"Limitless directions.": "无限方向。"
  ,"Discover · Prepare · Prove": "发现 · 准备 · 证明"
});

Object.assign(translations, {
  "for students aged 10–24": "服务 10–24 岁学生",
  "Singapore · Ages 14–18": "新加坡 · 14–18 岁",
  "How can I make my pitch stand out?": "怎样让我的路演更出彩？",
  "94% MATCH": "94% 匹配",
  "89% MATCH": "89% 匹配",
  "86% MATCH": "86% 匹配",
  "Young Founders Challenge": "青年创办者挑战赛",
  "Future Leaders Lab": "未来领袖实验室",
  "Youth Debate Open": "青年公开辩论赛",
  "Innovation · Singapore": "创新 · 新加坡",
  "Leadership · Hybrid": "领导力 · 混合模式",
  "Communication · Online": "沟通 · 线上",
  "Apply by 18 Aug": "8 月 18 日前申请",
  "Apply by 24 Aug": "8 月 24 日前申请",
  "Apply by 02 Sep": "9 月 2 日前申请",
  "My portfolio": "我的作品集",
  "Student · Aspiring founder": "学生 · 未来创办者",
  "Projects": "项目",
  "Skills": "技能",
  "Badges": "徽章",
  "Portfolio strength": "作品集完整度",
  "82% complete": "已完成 82%",
  "Recent wins": "近期成果",
  "View all": "查看全部",
  "COMPETITION": "比赛",
  "Young Innovators Finalist": "青年创新者决赛入围者",
  "Verified · July 2026": "已认证 · 2026 年 7 月",
  "SKILL BADGE": "技能徽章",
  "Confident Communicator": "自信沟通者",
  "Level 2 · June 2026": "二级 · 2026 年 6 月",
  "Share portfolio": "分享作品集",
  "New skill verified": "新技能已认证",
  "Public Speaking": "公众演讲",
  "Portfolio update": "作品集已更新",
  "Challenge completed": "挑战已完成",
  "Turn participation into a verified, shareable story of your skills, projects and progress—ready for schools, scholarships and first opportunities.": "把每次参与转化为经过认证、可分享的技能、项目与成长记录，为学校申请、奖学金和初次实践机会做好准备。",
  "Verified achievements": "认证成果",
  "Proof that travels with you": "随时可用的成长证明",
  "One-link sharing": "一键链接分享",
  "Always polished, always current": "始终专业，持续更新",
  "Build your future": "打造你的未来",
});

Object.assign(translations, {
  "TeenLaunch | Partner Submission": "TeenLaunch | 合作伙伴提交",
  "Opportunity Scout foundation": "机会发掘合作平台",
  "Share an opportunity with TeenLaunch.": "与 TeenLaunch 分享一个机会。",
  "Partner submissions are reviewed by a TeenLaunch admin before students can see them. Submission does not guarantee approval or publication.": "合作伙伴提交的机会将由 TeenLaunch 管理员审核，审核通过后学生才能看到。提交并不保证获批或发布。",
  "Loading partner workspace...": "正在加载合作伙伴工作区……",
  "Step 1": "步骤 1",
  "Partner organisation": "合作伙伴机构",
  "Not registered": "尚未注册",
  "Organisation name": "机构名称",
  "Organisation description": "机构简介",
  "Website": "网站",
  "Logo URL": "标志图片链接",
  "Contact name": "联系人姓名",
  "Contact email": "联系人电邮",
  "Register organisation": "注册机构",
  "Save organisation": "保存机构",
  "Contact information is private and is only available to authorised partner members and TeenLaunch admins.": "联系信息属于私密资料，仅授权的合作伙伴成员和 TeenLaunch 管理员可以查看。",
  "Step 2": "步骤 2",
  "Submit an opportunity": "提交机会",
  "Admin review required": "需要管理员审核",
  "Partner organisation": "合作伙伴机构",
  "Register an organisation first": "请先注册一个机构",
  "Select organisation": "选择机构",
  "Title": "标题",
  "Category": "类别",
  "Innovation Workshops": "创新工作坊",
  "Description": "说明",
  "Skills": "技能",
  "Comma separated": "用逗号分隔",
  "Design, teamwork": "设计、团队合作",
  "Education levels": "教育程度",
  "Polytechnic, Secondary School": "理工学院、中学",
  "Mode": "形式",
  "Select": "请选择",
  "Online": "线上",
  "In person": "线下",
  "Hybrid": "混合模式",
  "Minimum age": "最低年龄",
  "Maximum age": "最高年龄",
  "Start date": "开始日期",
  "End date": "结束日期",
  "Deadline": "截止日期",
  "Location": "地点",
  "Application method": "申请方式",
  "TeenLaunch application": "TeenLaunch 站内申请",
  "External application": "外部申请",
  "Both": "两者皆可",
  "Application URL": "申请链接",
  "Official source URL": "官方来源链接",
  "External reference ID": "外部参考编号",
  "Optional duplicate check": "可选的重复检查",
  "Image URL": "图片链接",
  "Allow applications through TeenLaunch": "允许通过 TeenLaunch 申请",
  "Submit for review": "提交审核",
  "Resubmit for review": "重新提交审核",
  "Your records": "你的记录",
  "Submission status": "提交状态",
  "No opportunities submitted yet.": "尚未提交任何机会。",
  "Partner submission": "合作伙伴提交",
  "Updated": "更新于",
  "draft": "草稿",
  "pending review": "待审核",
  "verified": "已验证",
  "rejected": "已拒绝",
  "expired": "已过期",
  "Edit": "编辑",
  "Organisation details saved for TeenLaunch review.": "机构资料已保存，等待 TeenLaunch 审核。",
  "Opportunity submitted. It remains private until an admin verifies it.": "机会已提交。在管理员验证前，该机会将保持私密。",
  "An opportunity with this external reference already exists.": "具有此外部参考编号的机会已经存在。",
  "Request failed": "请求失败",
  "Make sure the Opportunity Scout migration has been run.": "请确认机会发掘平台的数据库迁移已完成。"
});

Object.assign(translations, {
  "TeenLaunch | Academic Competitions": "TeenLaunch | 学术类比赛",
  "Competitions (Academic)": "学术类比赛",
  "Language, mathematics, science, and humanities competitions.": "语言、数学、科学与人文类比赛。",
  "Find academic contests with rules, deadlines, prize information, and registration links in one place.": "在一个平台查找学术比赛，并查看规则、截止日期、奖项信息和报名链接。",
  "Next deadline": "下一个截止日期",
  "Loading...": "正在加载……",
  "Closed": "已截止",
  "Youth Essay & Speech Challenge registration closes soon.": "青少年作文与演讲挑战赛即将截止报名。",
  "Pick a subject track and start preparing early.": "选择一个学科方向并尽早开始准备。",
  "Language": "语言",
  "Youth Essay & Speech Challenge": "青少年作文与演讲挑战赛",
  "Competition details: write a short essay, then present a 2-minute speech if shortlisted.": "比赛内容：撰写一篇短文，入围后进行两分钟演讲。",
  "Rules: original writing, 800-word limit": "规则：原创文章，不超过 800 字",
  "Deadline: 15 Jul 2026": "截止日期：2026 年 7 月 15 日",
  "Prize information: certificates, books, mentorship": "奖项：证书、书籍和导师指导",
  "Registration link": "报名链接",
  "Mathematics": "数学",
  "Junior Math Sprint": "青少年数学冲刺赛",
  "Competition details: individual and team problem-solving rounds for different age bands.": "比赛内容：按不同年龄组进行个人和团队解题回合。",
  "Rules: no calculators in speed round": "规则：速算回合不可使用计算器",
  "Deadline: 22 Jul 2026": "截止日期：2026 年 7 月 22 日",
  "Prize information: medals and finalist showcase": "奖项：奖牌和入围作品展示",
  "Science": "科学",
  "Young Science Investigator": "青少年科学研究员",
  "Competition details: submit a simple experiment, poster, and 3-minute explanation.": "比赛内容：提交一个简单实验、海报和三分钟讲解。",
  "Rules: cite sources and show method": "规则：注明资料来源并展示研究方法",
  "Deadline: 5 Aug 2026": "截止日期：2026 年 8 月 5 日",
  "Prize information: lab visit and project grant": "奖项：实验室参观和项目资助",
  "Humanities": "人文",
  "History & Society Challenge": "历史与社会挑战赛",
  "Competition details: research a social issue and explain why it matters today.": "比赛内容：研究一个社会议题，并说明它在当今的重要性。",
  "Rules: solo or pair submission": "规则：个人或双人提交",
  "Deadline: 18 Aug 2026": "截止日期：2026 年 8 月 18 日",
  "Prize information: certificates and publishing feature": "奖项：证书和作品发布展示",
  "Upcoming events calendar": "近期活动日历",
  "July to September": "七月至九月",
  "Jul 15": "7 月 15 日",
  "Jul 22": "7 月 22 日",
  "Aug 05": "8 月 5 日",
  "Aug 18": "8 月 18 日",
  "Youth Essay & Speech deadline": "青少年作文与演讲挑战赛截止",
  "Junior Math Sprint deadline": "青少年数学冲刺赛截止",
  "Young Science Investigator deadline": "青少年科学研究员比赛截止",
  "History & Society Challenge deadline": "历史与社会挑战赛截止",
  "Reminders": "提醒",
  "Your list": "你的提醒列表",
  "No reminders yet. Add one from a competition card.": "尚无提醒。请从比赛卡片添加提醒。",
  "Set Reminder": "设置提醒",
  "Reminder Added": "已添加提醒",
  "All competitions": "所有比赛"
});

Object.assign(translations, {
  "TeenLaunch | Non-Academic Competitions": "TeenLaunch | 非学术类比赛",
  "Competitions (Non-Academic)": "非学术类比赛",
  "Startup pitch, debate, public speaking, and innovation challenges.": "创业路演、辩论、公众演讲与创新挑战赛。",
  "Find practical competitions where teens can pitch ideas, speak with confidence, build prototypes, and learn by doing.": "寻找实践型比赛，让青少年展示创意、自信表达、制作原型并从实践中学习。",
  "Youth Startup Pitch Challenge registration closes soon.": "青少年创业路演挑战赛即将截止报名。",
  "Build confidence through real-world challenges.": "通过真实世界的挑战建立自信。",
  "Startup Pitch Competitions": "创业路演比赛",
  "Youth Startup Pitch Challenge": "青少年创业路演挑战赛",
  "Rules: 3-minute pitch, 2-minute Q&A, solo or teams up to 4.": "规则：三分钟路演、两分钟问答，可个人参赛或最多四人组队。",
  "Timeline: Jul 1 briefing, Jul 20 finals": "赛程：7 月 1 日说明会，7 月 20 日决赛",
  "Prize pool: $5,000": "奖金总额：5,000 美元",
  "Debate Competitions": "辩论比赛",
  "Future Voices Debate Cup": "未来之声辩论杯",
  "Rules: prepared and impromptu rounds using school-friendly motions.": "规则：围绕适合学生的辩题进行准备辩论和即兴辩论。",
  "Timeline: Sep 5 qualifiers, Sep 19 finals": "赛程：9 月 5 日资格赛，9 月 19 日决赛",
  "Prize pool: trophies and mentorship": "奖项：奖杯和导师指导",
  "Public Speaking Competitions": "公众演讲比赛",
  "Speak Up Finals": "勇敢发声总决赛",
  "Rules: 4-minute prepared speech and 1-minute impromptu response.": "规则：四分钟准备演讲和一分钟即兴回应。",
  "Timeline: Aug 12 submissions, Aug 28 finals": "赛程：8 月 12 日提交，8 月 28 日决赛",
  "Prize pool: coaching and certificates": "奖项：专业辅导和证书",
  "Innovation Challenges": "创新挑战赛",
  "Community Innovation Challenge": "社区创新挑战赛",
  "Rules: submit a prototype, impact plan, and short demo video.": "规则：提交原型、影响力计划和简短演示视频。",
  "Timeline: Sep 1 proposal, Oct 10 showcase": "赛程：9 月 1 日提交方案，10 月 10 日成果展示",
  "Prize pool: seed grants and mentor access": "奖项：种子资助和导师资源",
  "Jul 01": "7 月 1 日",
  "Jul 20": "7 月 20 日",
  "Aug 28": "8 月 28 日",
  "Sep 05": "9 月 5 日",
  "Startup Pitch briefing": "创业路演说明会",
  "Pitch finals and demo day": "路演决赛与展示日",
  "Debate Cup qualifiers": "辩论杯资格赛"
});

Object.assign(translations, {
  "TeenLaunch | Resources": "TeenLaunch | 资源中心",
  "Resource hub": "资源中心",
  "Learn faster with workshops, showcases, and practical guides.": "通过工作坊、成果展示和实用指南更高效地学习。",
  "Use TeenLaunch resources to prepare for opportunities, sharpen pitches, improve presentations, and learn from past youth projects.": "使用 TeenLaunch 资源为机会做好准备、完善路演、提升演示能力，并从以往的青少年项目中学习。",
  "Next workshop": "下一场工作坊",
  "Pitching 101": "路演基础",
  "Build a clear problem, solution, proof, impact, and ask in one practice session.": "在一次练习中清楚呈现问题、解决方案、证据、影响力和具体诉求。",
  "View Calendar": "查看日历",
  "Resource Library": "资源库",
  "Everything students need before they apply, compete, or present.": "学生在申请、参赛或演示前所需的一切资源。",
  "Workshops": "工作坊",
  "Beginner sessions on entrepreneurship, ideation, public speaking, innovation, and project planning.": "适合初学者的创业、创意构思、公众演讲、创新和项目规划课程。",
  "Upcoming Events": "近期活动",
  "Shortlist upcoming talks, bootcamps, showcases, and practice sessions for ages 10-24.": "精选适合 10 至 24 岁青少年的讲座、训练营、成果展示和练习活动。",
  "Past User Showcase": "往期用户成果展示",
  "See student projects, pitch decks, prototypes, campaigns, and community ideas.": "查看学生项目、路演文稿、原型、活动方案和社区创意。",
  "Winning Teams/Projects": "获奖团队与项目",
  "Learn what strong youth teams did well: clear problem, evidence, teamwork, and delivery.": "了解优秀青少年团队的成功之处：明确的问题、充分的证据、团队合作和出色表达。",
  "Inspiration Section": "灵感专区",
  "Prompts, founder stories, innovation themes, and examples to spark new ideas.": "通过提示、创始人故事、创新主题和案例激发新创意。",
  "Pitching Tips": "路演技巧",
  "Keep it simple: problem, audience, solution, traction, impact, and one specific ask.": "保持简洁：问题、受众、解决方案、进展、影响力和一个明确诉求。",
  "Presentation Advice": "演示建议",
  "Use fewer words, stronger visuals, calm pacing, and rehearsal under time limits.": "减少文字、强化视觉效果、保持从容节奏，并在限时条件下排练。",
  "User Guide": "用户指南",
  "Learn how to set up your profile, discover opportunities, apply, plan, connect, and build a verified portfolio.": "了解如何设置个人资料、发现机会、提交申请、制定计划、建立联系并创建认证作品集。",
  "Open Help & Q&A": "打开帮助与常见问题",
  "Event Calendar": "活动日历",
  "Upcoming": "即将举行",
  "Jul 06": "7 月 6 日",
  "Jul 18": "7 月 18 日",
  "Aug 02": "8 月 2 日",
  "Aug 16": "8 月 16 日",
  "Pitching 101 workshop": "路演基础工作坊",
  "Innovation idea sprint": "创新创意冲刺活动",
  "Student showcase review": "学生成果展示评审",
  "Presentation practice clinic": "演示练习指导活动",
  "Quick Guide": "快速指南",
  "Before you present": "演示前的准备",
  "Cut every slide to one main idea.": "每张幻灯片只保留一个主要观点。",
  "Show who benefits and why now.": "说明谁会受益，以及为什么现在需要行动。",
  "Practise the first and final 20 seconds.": "练习开场和结尾的 20 秒。",
  "End with a clear next step.": "以明确的下一步行动结束。",
  "Find opportunities": "寻找机会"
});

Object.assign(translations, {
  "TeenLaunch | Soft Skills & Debate": "TeenLaunch | 软技能与辩论",
  "Soft skills lab": "软技能训练营",
  "Soft Skills & Debate": "软技能与辩论",
  "Speak. Think. Lead.": "表达、思考、领导。",
  "Build arguments, practice rebuttals, sharpen critical thinking, and grow into the kind of speaker people remember.": "学习构建论点、练习反驳、提升批判性思维，成为令人印象深刻的演讲者。",
  "Debate timer": "辩论计时器",
  "Speech minutes": "演讲时长（分钟）",
  "Speaker round": "发言环节",
  "Prime Minister": "正方一辩",
  "Opposition Leader": "反方一辩",
  "Rebuttal Speaker": "反驳发言者",
  "Reply Speech": "总结陈词",
  "Start": "开始",
  "Pause": "暂停",
  "Reset": "重置",
  "Practice mode ready.": "练习模式已准备。",
  "Learn the craft": "学习技巧",
  "Training blocks for stronger thinking, speaking, and leadership.": "通过系统训练，提升思考、表达与领导能力。",
  "Debate Basics": "辩论基础",
  "Learn roles, structures, motions, points of information, and speaker duties.": "学习辩论角色、流程、辩题、质询点和发言职责。",
  "Argument Building": "论点构建",
  "Use claim, reason, evidence, impact, and link-back to make points land.": "运用主张、理由、证据、影响和回扣，让论点更有说服力。",
  "Rebuttal Techniques": "反驳技巧",
  "Spot weak assumptions, compare impacts, and respond without sounding defensive.": "识别薄弱假设、比较影响，并以从容而不防御的方式回应。",
  "Public Speaking Tips": "公众演讲技巧",
  "Use pacing, pauses, posture, voice, and eye contact to sound confident.": "运用语速、停顿、姿态、声音和眼神交流，自信地表达。",
  "Critical Thinking Exercises": "批判性思维练习",
  "Practice weighing trade-offs, challenging assumptions, and ranking arguments.": "练习权衡利弊、质疑假设并判断论点的重要程度。",
  "Speaking Challenges": "演讲挑战",
  "Complete short daily drills for clarity, confidence, pace, and persuasive delivery.": "通过每日短练习提升表达清晰度、自信、节奏和说服力。",
  "Mock Debate Activities": "模拟辩论活动",
  "Run mini rounds with roles, motions, prep time, speeches, and reflection prompts.": "通过角色、辩题、准备时间、发言和复盘提示进行迷你辩论。",
  "Practice area": "练习区",
  "This house believes schools should teach entrepreneurship.": "本议院认为学校应教授创业知识。",
  "This house would ban homework for students under 14.": "本议院将禁止给 14 岁以下学生布置家庭作业。",
  "This house believes AI should be allowed in classrooms.": "本议院认为课堂上应允许使用人工智能。",
  "This house would make public speaking a core school subject.": "本议院将把公众演讲列为学校核心科目。",
  "This house believes teenagers should vote in local elections.": "本议院认为青少年应有权参与地方选举投票。",
  "This house would prioritize climate innovation over fast fashion.": "本议院将优先发展气候创新，而非快时尚。",
  "Generate Random Motion": "随机生成辩题",
  "AI Feedback Assistant": "AI 反馈助手",
  "Try giving one clear example after your strongest argument.": "在最有力的论点后加入一个清晰的例子。",
  "Your rebuttal is stronger when you compare impacts directly.": "直接比较双方影响，可以让反驳更有说服力。",
  "Debate Resources": "辩论资源",
  "Formats, rules, judging criteria, team roles, and sample speeches in one place.": "集中查看赛制、规则、评分标准、团队角色和演讲范例。",
  "Debate Topics": "辩论题目",
  "School-friendly motions about technology, education, climate, media, and leadership.": "浏览适合学生的科技、教育、气候、媒体和领导力辩题。",
  "Mini Quizzes": "迷你测验",
  "Check your understanding of argument structure, rebuttals, weighing, and delivery.": "检验你对论点结构、反驳、权衡和表达技巧的理解。",
  "Skill Badges": "技能徽章",
  "Earn badges for first speech, rebuttal practice, motion mastery, and mock debate rounds.": "通过首次演讲、反驳练习、掌握辩题和模拟辩论赢取徽章。",
  "Mini quiz": "迷你测验",
  "What should a strong argument include?": "有力的论点应包含什么？",
  "Claim, reasoning, evidence, impact": "主张、推理、证据和影响",
  "Only a loud voice": "只有响亮的声音",
  "A long quote with no explanation": "一段没有解释的长篇引文",
  "Correct. Strong arguments need structure and impact.": "回答正确。有力的论点需要清晰的结构和明确的影响。",
  "Try again. Judges need reasoning, proof, and impact.": "请再试一次。评委需要看到推理、证据和影响。",
  "Progress tracking": "进度追踪",
  "Practice streak:": "连续练习：",
  "days": "天",
  "First Speech": "首次演讲",
  "Rebuttal Rookie": "反驳新手",
  "3 Exercises Done": "已完成 3 项练习",
  "Find competitions": "寻找比赛",
  "Time. Reset for another round.": "时间到。请重置后开始下一轮。",
  "Paused. Breathe, then continue.": "已暂停。深呼吸后再继续。"
});

Object.assign(translations, {
  "TeenLaunch | Career Copilot": "TeenLaunch | 职业助手",
  "Career-focused guidance": "职业发展指导",
  "Explore possible career paths, useful skills and verified TeenLaunch opportunities using your profile and Career DNA.": "结合你的个人资料和职业 DNA，探索适合的职业方向、实用技能及经过验证的 TeenLaunch 机会。",
  "Clear conversation": "清除对话",
  "Try asking": "你可以这样问",
  "Recommend opportunities for me": "为我推荐合适的机会",
  "Explain my Career DNA results": "解释我的职业 DNA 结果",
  "Help me plan a path towards my dream career": "帮我规划通往理想职业的路线",
  "What skills should I develop?": "我应该培养哪些技能？",
  "How can I improve my portfolio?": "我该如何改进作品集？",
  "The Copilot uses only relevant details from your TeenLaunch account. It cannot access admin-only information.": "职业助手只会使用你 TeenLaunch 账户中的相关资料，无法访问仅限管理员查看的信息。",
  "Career Copilot is thinking…": "职业助手正在思考……",
  "Ask Career Copilot": "向职业助手提问",
  "Ask about career paths, skills, your portfolio or TeenLaunch opportunities…": "询问职业方向、技能、作品集或 TeenLaunch 机会……",
  "Send": "发送",
  "TeenLaunch Career Copilot provides general guidance. Important education and career decisions should also be discussed with a parent, teacher or career counsellor.": "TeenLaunch 职业助手提供一般性指导。重要的升学和职业决定也应与家长、老师或职业顾问讨论。",
  "Hi! I’m your TeenLaunch Career Copilot. I can help you understand your Career DNA, explore skills and find suitable verified TeenLaunch opportunities.": "你好！我是你的 TeenLaunch 职业助手。我可以帮助你了解职业 DNA、探索技能，并寻找适合且经过验证的 TeenLaunch 机会。",
  "Conversation cleared. What career goal would you like to explore?": "对话已清除。你想探索什么职业目标？",
  "Personalised Career Copilot guidance": "个性化职业助手指导",
  "TeenLaunch database guidance": "TeenLaunch 数据库指导",
  "TeenLaunch guidance": "TeenLaunch 指导",
  "Recommended TeenLaunch opportunities": "推荐的 TeenLaunch 机会",
  "View verified opportunity details": "查看已验证的机会详情",
  "Career Copilot could not respond.": "职业助手暂时无法回应。"
});

Object.assign(translations, {
  "TeenLaunch | Life Planner": "TeenLaunch | 生活规划器",
  "Personalised smart planner": "个性化智能规划器",
  "Make space for what matters.": "为真正重要的事留出时间。",
  "Balance school, commitments, opportunities and rest with transparent scheduling rules you control.": "通过由你掌控的清晰排程规则，平衡学业、日常事务、发展机会与休息。",
  "Suggest my week": "为我规划本周",
  "Loading your planner…": "正在加载你的规划器……",
  "Previous week": "上一周",
  "Next week": "下一周",
  "This week": "本周",
  "Planning preferences": "规划偏好",
  "Your boundaries": "你的时间界限",
  "Close": "关闭",
  "Education level": "教育阶段",
  "e.g. Polytechnic": "例如：理工学院",
  "Preferred session": "偏好的单次时长",
  "30 minutes": "30 分钟",
  "45 minutes": "45 分钟",
  "60 minutes": "60 分钟",
  "90 minutes": "90 分钟",
  "120 minutes": "120 分钟",
  "Wake time": "起床时间",
  "Sleep time": "睡觉时间",
  "Preferred study start": "偏好的学习开始时间",
  "Preferred study end": "偏好的学习结束时间",
  "School days and hours": "上课日与上课时间",
  "Preferred rest days": "偏好的休息日",
  "Personal goals": "个人目标",
  "What would you like to make time for?": "你想为哪些事情安排时间？",
  "Save preferences": "保存偏好",
  "Add to planner": "添加到规划器",
  "New task": "新任务",
  "Cancel": "取消",
  "Title": "标题",
  "Revision, CCA, assignment…": "复习、课外活动、作业……",
  "Category": "类别",
  "School": "学校",
  "Study": "学习",
  "CCA": "课外活动",
  "Tuition": "补习",
  "Opportunity": "发展机会",
  "Personal": "个人事务",
  "Priority": "优先级",
  "Low": "低",
  "Medium": "中",
  "High": "高",
  "Notes": "备注",
  "Start": "开始",
  "End": "结束",
  "Deadline": "截止日期",
  "Time needed": "所需时间",
  "Repeat": "重复",
  "Does not repeat": "不重复",
  "Daily": "每天",
  "Weekly": "每周",
  "Add task": "添加任务",
  "Automatically connected": "自动关联",
  "Opportunity deadlines": "机会截止日期",
  "From opportunities you saved or applied for.": "来自你已收藏或申请的机会。",
  "No linked deadlines yet.": "目前没有关联的截止日期。",
  "Planned": "已规划",
  "Suggestion": "建议",
  "Completed": "已完成",
  "Overdue": "已逾期",
  "Nothing overdue.": "没有逾期任务。",
  "Upcoming": "即将到来",
  "No upcoming tasks.": "没有即将到来的任务。",
  "No completed tasks yet.": "目前没有已完成的任务。",
  "Edit task": "编辑任务",
  "Update task": "更新任务",
  "Task added to your planner.": "任务已添加到你的规划器。",
  "Task updated in your planner.": "规划器中的任务已更新。",
  "The planner could not be updated.": "无法更新规划器。",
  "Preferences saved.": "规划偏好已保存。",
  "Your suggested week is ready.": "你的本周建议计划已生成。"
  ,"Monday": "星期一", "Tuesday": "星期二", "Wednesday": "星期三", "Thursday": "星期四", "Friday": "星期五", "Saturday": "星期六", "Sunday": "星期日"
  ,"Mon": "周一", "Tue": "周二", "Wed": "周三", "Thu": "周四", "Fri": "周五", "Sat": "周六", "Sun": "周日"
  ,"school start": "上课开始", "school end": "上课结束"
  ,"Accept": "接受", "Reject": "拒绝", "Edit": "编辑", "Delete": "删除", "Done": "完成", "Reopen": "重新打开"
  ,"Save changes": "保存更改", "Due": "截止", "Not scheduled": "尚未安排"
  ,"school": "学校", "study": "学习", "cca": "课外活动", "tuition": "补习", "opportunity": "发展机会", "personal": "个人事务"
  ,"low": "低", "medium": "中", "high": "高", "Task updated.": "任务已更新。", "Task added.": "任务已添加。", "Planner updated.": "规划器已更新。", "Planning preferences saved.": "规划偏好已保存。", "Building a balanced suggestion with scheduling rules…": "正在根据排程规则制定平衡的建议计划……"
});

Object.assign(translations, {
  "TeenLaunch | Find People": "TeenLaunch | 寻找伙伴",
  "TeenLaunch community": "TeenLaunch 社区",
  "Find People": "寻找伙伴",
  "Search by username or name, follow other members, and start a conversation.": "通过用户名或姓名搜索、关注其他成员并开始对话。",
  "Search users": "搜索用户",
  "Search username or name…": "搜索用户名或姓名……",
  "Search": "搜索",
  "Enter at least two characters to search.": "请输入至少两个字符进行搜索。",
  "Searching…": "正在搜索……",
  "No matching usernames found.": "没有找到匹配的用户。",
  "New followers": "新关注者",
  "Open inbox": "打开收件箱",
  "No new followers yet.": "目前没有新的关注者。",
  "Following": "已关注",
  "Follow back": "回关",
  "Follow": "关注",
  "Message": "发消息",
  "TeenLaunch user": "TeenLaunch 用户",
  "Request failed": "请求失败",
  "TeenLaunch | Inbox": "TeenLaunch | 收件箱",
  "Updates and messages": "动态与消息",
  "Inbox": "收件箱",
  "Find people": "寻找伙伴",
  "Messages": "消息",
  "Updates": "动态",
  "No messages yet.": "目前没有消息。",
  "No updates yet.": "目前没有动态。",
  "Your messages": "你的消息",
  "Choose a conversation or find someone to message.": "选择一个对话，或寻找伙伴开始聊天。",
  "Write a message…": "输入消息……",
  "Loading your inbox…": "正在加载收件箱……"
});

Object.assign(translations, {
  "TeenLaunch | My Profile": "TeenLaunch | 我的个人主页",
  "Loading your profile...": "正在加载你的个人主页……",
  "Profile picture": "个人头像",
  "Applications": "申请",
  "Followers": "关注者",
  "Following": "正在关注",
  "Find People": "寻找伙伴",
  "MY TIER": "我的等级",
  "Explorer": "探索者",
  "Challenger": "挑战者",
  "Builder": "实践者",
  "Leader": "领导者",
  "Trailblazer": "开拓者",
  "Start your journey": "开始你的成长旅程",
  "Highest tier reached": "已达到最高等级",
  "day": "天",
  "streak": "连续记录",
  "Rewards journey": "奖励历程",
  "Level up. Unlock more.": "升级并解锁更多奖励。",
  "Starter profile badge": "新手个人主页徽章",
  "One streak freeze": "一次连续记录保护",
  "Workshop priority access": "工作坊优先参加资格",
  "Mentor matching priority": "导师配对优先权",
  "Featured community profile": "社区精选个人主页",
  "Experiences": "经历",
  "Applied": "已申请",
  "Saved": "已收藏",
  "About": "关于",
  "My experiences": "我的经历",
  "Your visual diary of events, projects and growth.": "记录活动、项目与成长的视觉日记。",
  "＋ Add experience": "＋ 添加经历",
  "Event or experience": "活动或经历",
  "e.g. Youth Founders Bootcamp": "例如：青少年创始人训练营",
  "Date": "日期",
  "Caption": "说明",
  "What happened? What did you learn?": "发生了什么？你学到了什么？",
  "Photo": "照片",
  "JPG, PNG or WebP · maximum 4 MB": "JPG、PNG 或 WebP，最大 4 MB",
  "Share experience": "分享经历",
  "Your experience story starts here.": "从这里开始记录你的经历。",
  "Add your first experience": "添加你的第一段经历",
  "Applied Opportunities": "已申请的机会",
  "Saved Opportunities": "已收藏的机会",
  "You have not applied for any opportunities yet.": "你目前还没有申请任何机会。",
  "You have not saved any opportunities yet.": "你目前还没有收藏任何机会。",
  "Browse Opportunities": "浏览机会",
  "Full name": "姓名",
  "Bio": "个人简介",
  "School": "学校",
  "Education": "教育阶段",
  "Retry": "重试",
  "+5 XP earned": "+5 XP 已获得",
  "No caption added.": "未添加说明。",
  "Opportunity": "机会",
  "Deadline:": "截止日期：",
  "Rolling": "滚动截止",
  "View Details": "查看详情",
  "Remove": "移除",
  "No bio yet.": "暂未填写个人简介。",
  "Choose a photo no larger than 4 MB.": "请选择不超过 4 MB 的照片。",
  "Sharing your experience…": "正在分享你的经历……"
});

Object.assign(translations, {
  "Account": "账户",
  "Edit your profile and open your portfolio.": "编辑个人资料并打开你的作品集。",
  "Personality Test": "性格测试",
  "View your Career DNA result or choose to retake the test.": "查看你的职业 DNA 结果，或选择重新测试。",
  "Help & User Manual": "帮助与用户手册",
  "Read common answers or download the TeenLaunch PDF guide.": "阅读常见问题解答，或下载 TeenLaunch PDF 指南。",
  "Edit Profile": "编辑个人资料",
  "Help & Q&A": "帮助与常见问题"
});

Object.assign(translations, {
  "TeenLaunch | Login": "TeenLaunch | 登录",
  "TeenLaunch Account": "TeenLaunch 账户",
  "Login to continue": "登录以继续",
  "Create your account": "创建你的账户",
  "Sign in or create an account to save opportunities, register for programmes, and use your Career DNA results.": "登录或创建账户，即可收藏机会、报名参加活动并使用你的职业 DNA 结果。",
  "Authentication options": "身份验证选项",
  "Login": "登录",
  "Register": "注册",
  "Email": "电子邮箱",
  "Password": "密码",
  "Full name": "姓名",
  "Confirm password": "确认密码",
  "Age": "年龄",
  "TeenLaunch is designed for ages 10–24, but anyone may create an account.": "TeenLaunch 主要面向 10 至 24 岁用户，但任何人都可以创建账户。",
  "School name": "学校名称",
  "Optional": "选填",
  "Education level": "教育阶段",
  "Select education level": "选择教育阶段",
  "Secondary School": "中学",
  "Junior College": "初级学院",
  "Polytechnic": "理工学院",
  "University": "大学",
  "Other": "其他",
  "Create Account": "创建账户",
  "User profile not found": "找不到用户个人资料。请重试或联系 TeenLaunch 支持。",
  "Invalid email or password": "电子邮箱或密码不正确。",
  "Logging you in...": "正在登录……",
  "Checking your Career DNA profile...": "正在检查你的职业 DNA 资料……",
  "You are already signed in. Continuing...": "你已登录，正在继续……",
  "Your session has expired. Please log in again.": "登录状态已过期，请重新登录。",
  "Something went wrong. Please try again.": "出现问题，请重试。",
  "Login succeeded, but no token was returned.": "登录成功，但系统未返回登录凭证。",
  "Passwords do not match. Please check both password fields.": "两次输入的密码不一致，请检查。",
  "Please enter a valid age as a whole number.": "请输入有效的整数年龄。",
  "Creating your account...": "正在创建账户……",
  "Account created successfully. Please log in to continue.": "账户创建成功，请登录以继续。"
});

Object.assign(translations, {
  "TeenLaunch | My Portfolio": "TeenLaunch | 我的作品集",
  "Edit portfolio": "编辑作品集",
  "Print / Save as PDF": "打印／另存为 PDF",
  "Copy public link": "复制公开链接",
  "Loading portfolio…": "正在加载作品集……",
  "Verified TeenLaunch Portfolio": "已认证的 TeenLaunch 作品集",
  "TeenLaunch member": "TeenLaunch 成员",
  "Career DNA": "职业 DNA",
  "Digital Maker": "数字创作者",
  "Your strongest Career DNA types are Builder and Creator.": "你最突出的职业 DNA 类型是实践者和创造者。",
  "Verified Achievements": "认证成就",
  "No published achievements.": "暂无已发布的成就。",
  "Projects": "项目",
  "New project": "新项目",
  "No published projects.": "暂无已发布的项目。",
  "Skills": "技能",
  "No published skills.": "暂无已发布的技能。",
  "Certificates": "证书",
  "No published certificates.": "暂无已发布的证书。",
  "Personal Reflections": "个人反思",
  "No published reflections.": "暂无已发布的个人反思。",
  "Contact": "联系",
  "Social profile": "社交主页",
  "Verified": "已认证",
  "Achievement": "成就",
  "Completed": "已完成",
  "Admin remarks:": "管理员备注：",
  "Evidence": "证明材料",
  "Verified certificate": "认证证书",
  "Certificate": "证书",
  "View certificate": "查看证书",
  "Reflection": "个人反思",
  "Portfolio could not be loaded": "无法加载作品集",
  "Make your portfolio public in the builder first.": "请先在作品集编辑器中将作品集设为公开。",
  "Public link copied.": "公开链接已复制。"
});

Object.assign(translations, {
  "TeenLaunch | Portfolio Builder": "TeenLaunch | 作品集编辑器",
  "Verified Portfolio Builder": "认证作品集编辑器",
  "Build your portfolio": "创建你的作品集",
  "Official completion details stay locked. You control reflections, projects and what becomes public.": "官方完成记录将保持锁定；你可以管理个人反思、项目以及公开展示的内容。",
  "Preview": "预览",
  "Loading your portfolio…": "正在加载你的作品集……",
  "Public portfolio:": "公开作品集：",
  "Portfolio settings": "作品集设置",
  "Introduction": "自我介绍",
  "Introduce yourself": "介绍一下自己",
  "Personal description": "个人说明",
  "What are you working towards?": "你目前正在朝什么目标努力？",
  "Public link": "公开链接",
  "Email or contact link": "电子邮箱或联系链接",
  "LinkedIn or social link": "LinkedIn 或社交链接",
  "Make portfolio public": "公开作品集",
  "Save portfolio settings": "保存作品集设置",
  "Completed activities verified by an admin appear here.": "经管理员认证为已完成的活动会显示在这里。",
  "No verified achievements yet. An admin must mark an activity completed and verified.": "目前没有认证成就。活动必须由管理员标记为已完成并认证。",
  "Portfolio Achievements": "作品集成就",
  "Reorder with the arrow buttons, add evidence and choose what to publish.": "使用箭头按钮调整顺序、添加证明材料，并选择要发布的内容。",
  "Add a verified achievement from above.": "从上方添加一项认证成就。",
  "Add your own projects and supporting evidence.": "添加你自己的项目及相关证明材料。",
  "Add project": "添加项目",
  "No projects added yet.": "目前还没有添加项目。",
  "Add to portfolio": "添加到作品集",
  "Completed programme": "已完成的活动",
  "Organisation": "主办机构",
  "date not provided": "未提供日期",
  "Remove": "移除",
  "Programme, organisation, verification and completion details are locked.": "活动、主办机构、认证和完成记录均已锁定。",
  "Format with writing template": "使用写作模板优化",
  "Skills learned": "学到的技能",
  "Teamwork, Public speaking": "团队合作、公众演讲",
  "Project images or evidence URLs": "项目图片或证明材料链接",
  "https://… separated by commas": "多个链接请用逗号分隔",
  "Show on public portfolio": "在公开作品集中显示",
  "Save achievement": "保存成就",
  "Project title": "项目名称",
  "Description": "说明",
  "Evidence URLs": "证明材料链接",
  "Show publicly": "公开显示",
  "Save project": "保存项目",
  "Delete": "删除",
  "Achievement added.": "成就已添加。",
  "Achievement saved.": "成就已保存。",
  "Project saved.": "项目已保存。",
  "Portfolio settings saved.": "作品集设置已保存。",
  "Make the portfolio public first.": "请先将作品集设为公开。",
  "Copying was blocked by the browser. Use the visible public link instead.": "浏览器阻止了复制，请改用页面上显示的公开链接。",
  "Adding...": "正在添加……",
  "New project added.": "新项目已添加。",
  "Request failed": "请求失败",

  "Featured opportunities": "精选机会",
  "Realistic next steps for students who want to start building.": "为希望开始实践的学生提供切实可行的下一步。",
  "A beginner-friendly workshop for researching, prototyping, and presenting ideas with AI tools.": "适合初学者的工作坊，学习使用 AI 工具进行研究、制作原型和展示创意。",
  "A structured entrepreneurship track for students ready to test and pitch a first venture.": "为准备测试并展示首个创业项目的学生提供结构化创业课程。",
  "Start here": "从这里开始",
  "AI chatbot preview": "AI 聊天助手预览",
  "Supported platforms": "支持的平台",

  "TeenLaunch Mobile Experience": "TeenLaunch 移动体验",
  "A mobile launchpad that helps young people discover, prepare for and capture opportunities that shape their future.": "帮助年轻人发现、准备并把握塑造未来机会的移动平台。",
  "Built with students,": "与学生共同打造，",
  "Deadline reminder": "截止日期提醒",
  "3 days left": "还剩 3 天",
  "Great match": "高度匹配",
  "For your goals": "符合你的目标",
  "Good morning,": "早上好，",
  "Hey, Jennie!": "你好，Jennie！",
  "Your weekly momentum": "你的每周进度",
  "3 of 4 goals complete": "已完成 4 个目标中的 3 个",
  "Picked for you": "为你精选",
  "See all": "查看全部",
  "FEATURED": "精选",
  "INNOVATION": "创新",
  "Young Founders": "青年创始人",
  "Challenge 2026": "2026 挑战赛",
  "94% match": "匹配度 94%",
  "Explore by interest": "按兴趣探索",
  "Startup": "创业",
  "Speaking": "演讲",
  "Innovation": "创新",
  "Discover": "发现",
  "AI Guide": "AI 指南",
  "Portfolio": "作品集",
  "One journey, all in one place": "一段旅程，尽在一处",
  "From “what’s next?”": "从“下一步是什么？”",
  "to": "到",
  "“I did it.”": "“我做到了。”",
  "TeenLaunch turns scattered information into a clear, personal path forward.": "TeenLaunch 将零散信息转化为清晰且个性化的前进路线。",
  "DISCOVER": "发现",
  "Matches made": "与你的志向",
  "for your ambition.": "相匹配。",
  "Smart recommendations based on your age, interests and goals—not an endless list of links.": "根据你的年龄、兴趣和目标提供智能推荐，而不是无尽的链接列表。",
  "Personal match score": "个人匹配评分",
  "Clear eligibility at a glance": "资格条件一目了然",
  "Deadline reminders": "截止日期提醒",
  "Search opportunities": "搜索机会",
  "For you": "为你推荐",
  "24 opportunities matched": "匹配到 24 个机会",
  "PREPARE": "准备",
  "An AI guide that": "了解你下一步的",
  "knows your next step.": "AI 指南。",
  "Get plain-language answers, application help and confidence-building guidance whenever you need it.": "随时获得简单易懂的解答、申请帮助和增强自信的指导。",
  "PROVE YOUR GROWTH": "证明你的成长",
  "Every experience": "每一段经历",
  "becomes": "都能成为",
  "evidence.": "成长证明。",
  "One app.": "一个应用，",
  "Limitless directions.": "无限方向。",
  "Be first to experience TeenLaunch on mobile.": "率先体验 TeenLaunch 移动版。",
  "Discover · Prepare · Prove": "发现 · 准备 · 证明",
  "TeenLaunch mobile home screen preview": "TeenLaunch 移动版主页预览",
  "Save opportunity": "收藏机会",

  "Back to Profile": "返回个人主页",
  "Loading profile...": "正在加载个人资料……",
  "(optional)": "（选填）",
  "Phone number": "电话号码",
  "Tell people about yourself": "向大家介绍一下自己",

  "TeenLaunch | Career DNA Result": "TeenLaunch | 职业 DNA 结果",
  "Loading your Career DNA...": "正在加载你的职业 DNA……",
  "Your Career DNA": "你的职业 DNA",
  "Recommended job families": "推荐职业类别",
  "Opportunity types": "机会类型",
  "Explore opportunities": "探索机会",
  "Retake Career DNA Test": "重新进行职业 DNA 测试",
  "We could not load your result.": "无法加载你的测试结果。",
  "Try again": "重试",
  "TeenLaunch | Career DNA Test": "TeenLaunch | 职业 DNA 测试",
  "Discover your strengths": "发现你的优势",
  "Career DNA Test": "职业 DNA 测试",
  "Choose the answer that feels most like you. There are no wrong answers.": "选择最符合你的答案；这里没有错误答案。",
  "Question 1 of 10": "第 1 题，共 10 题",
  "Select one answer": "选择一个答案",
  "Previous": "上一题",
  "Restart Test": "重新测试",
  "Next": "下一题",
  "Confirming your session...": "正在确认登录状态……",
  "Test progress": "测试进度",

  "TeenLaunch | Apply": "TeenLaunch | 申请",
  "Loading opportunity...": "正在加载机会……",
  "Eligibility": "资格条件",
  "Format/location": "形式／地点",
  "Organisation": "主办机构",
  "Date of birth": "出生日期",
  "Current education level": "目前教育阶段",
  "Resume URL": "履历链接",
  "Why are you interested?": "你为什么感兴趣？",
  "Additional comments": "其他补充说明",
  "I confirm that the submitted information is accurate.": "我确认所提交的信息准确无误。",
  "Submit application": "提交申请",
  "Application unavailable": "暂时无法申请",
  "Back to opportunities": "返回机会列表",

  "TeenLaunch | Opportunity Details": "TeenLaunch | 机会详情",
  "All opportunities": "所有机会",
  "Recommended for You": "为你推荐",
  "Opportunity unavailable": "机会暂不可用",
  "Age eligibility": "年龄资格",
  "Education eligibility": "教育资格",
  "Format and location": "形式与地点",
  "Official application page": "官方申请页面",

  "TeenLaunch | Recommended Opportunities": "TeenLaunch | 推荐机会",
  "Career DNA matches": "职业 DNA 匹配",
  "Rule-based recommendations using your Career DNA strengths and eligibility details.": "根据你的职业 DNA 优势和资格信息生成规则化推荐。",
  "Finding your best matches...": "正在寻找最适合你的机会……",
  "Comparing your latest Career DNA result with active opportunities.": "正在将你最新的职业 DNA 结果与开放机会进行比较。",
  "Complete your Career DNA Test to unlock personalised recommendations.": "完成职业 DNA 测试以解锁个性化推荐。",
  "Take the Career DNA Test": "进行职业 DNA 测试",
  "No personalised matches are available yet.": "目前还没有个性化匹配结果。",
  "Check back when new opportunities are published.": "新机会发布后请再回来查看。",
  "Browse all opportunities": "浏览所有机会",
  "We could not load your recommendations.": "无法加载你的推荐。",

  "TeenLaunch | Member Profile": "TeenLaunch | 成员个人主页",
  "Loading profile…": "正在加载个人资料……",
  "No applied opportunities to show.": "没有可显示的已申请机会。",
  "No saved opportunities to show.": "没有可显示的已收藏机会。",
  "Back to Find People": "返回寻找伙伴",
  "Profile sections": "个人主页分区",
  "TeenLaunch | Connections": "TeenLaunch | 人际关系",
  "Connections": "人际关系",
  "Loading…": "正在加载……",

  "TeenLaunch | Public Portfolio": "TeenLaunch | 公开作品集",
  "Verified Portfolio": "认证作品集",
  "Loading public portfolio…": "正在加载公开作品集……",

  "Main navigation": "主导航",
  "TeenLaunch home": "TeenLaunch 首页",
  "Open navigation": "打开导航菜单",
  "Competition categories": "比赛类别",
  "Switch language": "切换语言",
  "Showcase navigation": "展示页导航",
  "Opportunity categories": "机会类别",
  "Opportunity filters": "机会筛选",
  "Theme choices": "主题选择",
  "Close post": "关闭帖子"
});

Object.assign(translations, {
  "⏱ Apply by 18 Aug": "⏱ 8 月 18 日前申请",
  "⏱ Apply by 24 Aug": "⏱ 8 月 24 日前申请",
  "⏱ Apply by 02 Sep": "⏱ 9 月 2 日前申请",
  "“How can I make my pitch stand out?”": "“怎样让我的路演更出色？”",
  "Profile": "个人主页",

  "TeenLaunch platform overview.": "TeenLaunch 平台概览。",
  "Checking admin access...": "正在检查管理员权限……",
  "Total users": "用户总数",
  "Total opportunities": "机会总数",
  "Total registrations": "报名总数",
  "Refresh Data": "刷新数据",
  "Manage Opportunities": "管理机会",
  "Manage Registrations": "管理报名",
  "Categories": "类别",
  "Select one or more": "选择一个或多个",
  "Select categories": "选择类别",
  "Separate skills with commas": "多个技能请用逗号分隔",
  "Select all that apply": "选择所有适用项",
  "Select education levels": "选择教育阶段",
  "Status": "状态",
  "Active": "开放中",
  "Inactive": "未启用",
  "Draft": "草稿",
  "Archived": "已归档",
  "Source type": "来源类型",
  "TeenLaunch-created": "由 TeenLaunch 创建",
  "Public source, manually reviewed": "公开来源，人工审核",
  "Expiry date": "到期日期",
  "Enable internal applications": "启用站内申请",
  "Opportunity review queue": "机会审核队列",
  "Loading review queue…": "正在加载审核队列……",
  "Partner management": "合作伙伴管理",
  "Loading partners…": "正在加载合作伙伴……",
  "Startup Basics Cohort": "创业基础课程",
  "A guided online programme covering ideation, customer research, simple finance, and pitching.": "涵盖创意构思、客户研究、基础财务和路演的线上指导课程。",
  "Communication, pitching, teamwork": "沟通、路演、团队合作",
  "Singapore or Online": "新加坡或线上",

  "TeenLaunch | Help & User Manual": "TeenLaunch | 帮助与用户手册",
  "Help centre": "帮助中心",
  "TeenLaunch Help Centre": "TeenLaunch 帮助中心",
  "Start confidently. Find answers quickly.": "自信开始，快速找到答案。",
  "This guide covers account setup, opportunities, Career DNA, planning, community, privacy, and troubleshooting.": "本指南涵盖账户设置、机会、职业 DNA、规划、社区、隐私和故障排除。",
  "Updated edition - August 2026": "更新版本：2026 年 8 月",
  "TeenLaunch User Manual": "TeenLaunch 用户手册",
  "A printable guide covering the latest mobile navigation, reminders, planning, XP, portfolio, inbox, language, partner, and account features.": "可打印指南，涵盖最新的移动导航、提醒、规划、XP、作品集、收件箱、语言、合作伙伴和账户功能。",
  "Download PDF manual": "下载 PDF 用户手册",
  "First 10 minutes": "开始使用的前 10 分钟",
  "Your quickest route to value": "最快体验平台价值的步骤",
  "Create an account and confirm your profile details.": "创建账户并确认个人资料。",
  "Complete Career DNA to improve recommendations.": "完成职业 DNA 测试以改善推荐。",
  "Browse or search opportunities and check eligibility.": "浏览或搜索机会并检查资格条件。",
  "Save promising options, then apply before the official deadline.": "收藏合适的机会，并在官方截止日期前申请。",
  "Add goals in Life Planner and evidence in your portfolio.": "在生活规划器中添加目标，并在作品集中加入证明材料。",
  "Questions & answers": "问题与解答",
  "Frequently asked questions": "常见问题",
  "Who can use TeenLaunch?": "谁可以使用 TeenLaunch？",
  "TeenLaunch is designed primarily for young people aged 10-24. Parents, educators, opportunity partners, and authorised administrators may also use relevant parts of the platform.": "TeenLaunch 主要面向 10 至 24 岁的年轻人。家长、教育工作者、机会合作伙伴和获授权管理员也可使用平台的相关功能。",
  "Do I need an account to browse?": "浏览时需要账户吗？",
  "You can view public pages and opportunities without signing in. An account is required to save opportunities, apply through TeenLaunch, receive personalised recommendations, use planning and social features, and build a portfolio.": "无需登录即可查看公开页面和机会。收藏机会、通过 TeenLaunch 申请、获取个性化推荐、使用规划与社交功能以及创建作品集时则需要账户。",
  "How do recommendations work?": "推荐如何运作？",
  "Complete your profile and Career DNA test. TeenLaunch compares your strengths and eligibility information with opportunity metadata. A match is guidance, not a guarantee of acceptance or suitability.": "完成个人资料和职业 DNA 测试后，TeenLaunch 会将你的优势与资格信息和机会资料进行比较。匹配结果仅供参考，不保证获选或一定适合。",
  "How do I apply for an opportunity?": "如何申请机会？",
  "Open the opportunity details, check age, education, location, and deadline, then select Apply. Some opportunities use a TeenLaunch application form; others send you to the organiser's official page.": "打开机会详情，检查年龄、教育阶段、地点和截止日期，然后选择申请。有些机会使用 TeenLaunch 申请表，另一些则会跳转到主办方官方网站。",
  "Does saving an opportunity submit an application?": "收藏机会是否等于提交申请？",
  "No. Saving only bookmarks it. Your application is submitted only after you complete the application flow and receive confirmation.": "不是。收藏仅用于保存机会；只有完成申请流程并收到确认后，申请才算提交。",
  "How can I tell whether an opportunity is trustworthy?": "如何判断机会是否可信？",
  "Review the organiser, source label, eligibility, deadline, costs, and official link. TeenLaunch review signals reduce risk but do not replace your own checks. Never send passwords, one-time codes, or unexpected payments.": "检查主办方、来源标签、资格条件、截止日期、费用和官方链接。TeenLaunch 的审核标识有助降低风险，但不能取代你自己的核实。切勿发送密码、一次性验证码或支付来历不明的款项。",
  "What is a verified portfolio?": "什么是认证作品集？",
  "Your portfolio combines official completion records with reflections and projects you control. Official records remain locked. You choose whether the portfolio is public and can copy its public link from the builder.": "作品集结合官方完成记录、个人反思和你管理的项目。官方记录保持锁定；你可以决定是否公开作品集，并从编辑器复制公开链接。",
  "Can I change or retake Career DNA?": "可以修改或重新进行职业 DNA 测试吗？",
  "Yes. Open Settings, choose Personality Test, and use the retake option. Updated results may change your recommendations.": "可以。打开设置，选择性格测试，然后使用重新测试选项。更新后的结果可能会改变推荐内容。",
  "How do I change language or appearance?": "如何更改语言或外观？",
  "Use the language button in the navigation for supported bilingual content. Open Settings and Display Settings to switch the visual theme.": "使用导航中的语言按钮切换支持的双语内容。打开设置和显示设置以切换视觉主题。",
  "What should I do if a page will not load?": "页面无法加载时该怎么办？",
  "Check your connection, refresh once, and sign in again if your session expired. Try a current version of Chrome, Edge, Safari, or Firefox. If the issue continues, note the page and error and email support.": "检查网络连接并刷新一次；如果登录状态已过期，请重新登录。尝试使用最新版 Chrome、Edge、Safari 或 Firefox。若问题持续，请记录页面和错误并发送电子邮件给支持团队。",
  "How do I protect my privacy?": "如何保护隐私？",
  "Use a unique password, keep login codes private, and avoid posting personal addresses, phone numbers, schedules, or identity documents. Make a portfolio public only when you are comfortable sharing its contents.": "使用独立密码，妥善保管登录验证码，避免发布个人地址、电话号码、行程或身份证件。只有在愿意分享内容时才公开作品集。",
  "How do partners submit opportunities?": "合作伙伴如何提交机会？",
  "Sign in, open Submit an Opportunity from the Opportunities menu, enter accurate organiser and opportunity details, and submit for admin review. Submission does not guarantee publication.": "登录后，从机会菜单打开提交机会，填写准确的主办方和机会详情，再提交给管理员审核。提交不保证一定发布。",
  "How can I get more help or report a concern?": "如何获得更多帮助或报告问题？",
  ". Include the page, what you expected, what happened, and a screenshot without passwords or sensitive personal data. For an immediate safety concern, stop contact with the organiser and tell a trusted adult.": "。请注明相关页面、预期结果、实际情况，并附上不含密码或敏感个人资料的截图。如遇紧急安全问题，请停止与主办方联系，并告知可信赖的成年人。",
  "Still need help?": "仍然需要帮助？",
  "We want every next step to feel clear.": "我们希望每个下一步都清晰明了。",
  "Contact TeenLaunch support at": "请联系 TeenLaunch 支持：",
  "and include enough detail for the team to reproduce the issue.": "并提供足够详情，方便团队重现问题。",
  "Copy support email": "复制支持邮箱",

  "View all recommendations": "查看全部推荐",
  "Loading personalised recommendations...": "正在加载个性化推荐……",
  "Loading verified opportunities...": "正在加载已验证的机会……",
  "Checking current deadlines and application details.": "正在检查最新截止日期和申请详情。",
  "Physical, advanced": "线下，进阶",
  "Online, beginner": "线上，入门",
  "Physical, beginner": "线下，入门",
  "Design Thinking Lab": "设计思维实验室",
  "A practical workshop for turning everyday problems into testable youth project ideas.": "将日常问题转化为可测试青少年项目创意的实践工作坊。"
});

Object.assign(translations, {
  "Creator": "创造者",
  "Builder": "实践者",
  "Explorer": "探索者",
  "Connector": "连接者",
  "Leader": "领导者",
  "Creative Initiator": "创意发起者",
  "Community Storyteller": "社区故事讲述者",
  "Imaginative Researcher": "创意研究者",
  "Technical Investigator": "技术探索者",
  "Innovation Driver": "创新推动者",
  "Practical Supporter": "实践支持者",
  "Strategic Visionary": "战略远见者",
  "Insightful Guide": "洞察引导者",
  "Community Champion": "社区领航者",
  "Your Career DNA highlights the ways you naturally create, solve and lead.": "你的职业 DNA 展示了你在创造、解决问题和领导方面的自然优势。",
  "Design and media": "设计与媒体",
  "Content and communications": "内容与传播",
  "Creative technology": "创意科技",
  "Creative competitions": "创意比赛",
  "Media projects": "媒体项目",
  "Design workshops": "设计工作坊",
  "Engineering and technology": "工程与科技",
  "Product development": "产品开发",
  "Skilled technical work": "专业技术工作",
  "Hackathons": "黑客松",
  "Maker programmes": "创客项目",
  "Technology challenges": "科技挑战赛",
  "Research and analysis": "研究与分析",
  "Science and discovery": "科学与探索",
  "Strategy and policy": "战略与政策",
  "Research programmes": "研究项目",
  "Case competitions": "案例比赛",
  "Science challenges": "科学挑战赛",
  "Education and coaching": "教育与辅导",
  "Community services": "社区服务",
  "People and culture": "人才与文化",
  "Volunteering": "志愿服务",
  "Peer mentoring": "同伴指导",
  "Community projects": "社区项目",
  "Entrepreneurship": "创业",
  "Business leadership": "商业领导力",
  "Advocacy and public speaking": "倡议与公众演讲",
  "Leadership programmes": "领导力项目",
  "Pitch competitions": "路演比赛",
  "Student councils": "学生会",
  "I enjoy turning my ideas into videos, designs, stories or presentations.": "我喜欢把自己的想法转化为视频、设计、故事或演示。",
  "I often notice how the appearance or message of something could be improved.": "我经常注意到事物的外观或表达方式可以如何改进。",
  "I enjoy figuring out how apps, machines or technology work.": "我喜欢研究应用程序、机器或科技的运作方式。",
  "I prefer learning by building, testing or trying something myself.": "我更喜欢通过亲手制作、测试或尝试来学习。",
  "I like researching a topic and comparing information before making a decision.": "我喜欢在做决定前研究主题并比较信息。",
  "I enjoy finding patterns and understanding why something happened.": "我喜欢寻找规律，并了解事情发生的原因。",
  "I feel satisfied when I help someone learn or solve a problem.": "帮助别人学习或解决问题会让我感到满足。",
  "I enjoy working with different people and listening to their ideas.": "我喜欢与不同的人合作并倾听他们的想法。",
  "I naturally take charge when a group is unsure what to do next.": "当团队不确定下一步该做什么时，我会自然地站出来带领大家。",
  "I enjoy presenting my ideas and encouraging others to support them.": "我喜欢展示自己的想法，并鼓励他人支持。",
  "Strongly disagree": "非常不同意",
  "Disagree": "不同意",
  "Neutral": "中立",
  "Agree": "同意",
  "Strongly agree": "非常同意",
  "Submit Test": "提交测试",
  "Please answer all 10 questions before submitting.": "提交前请回答全部 10 道题。",
  "Saving your Career DNA result...": "正在保存你的职业 DNA 结果……",
  "The result could not be retrieved.": "无法获取测试结果。",
  "Please try again.": "请重试。"
});

const translate = (key, language) => {
  if (language !== "zh") return key;
  return translations[key] || key;
};

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
const originalAttributes = new WeakMap();

const translateMarkedElements = (root, language) => {
  const scope = root?.nodeType === Node.ELEMENT_NODE ? root : document;
  const marked = [
    ...(scope.matches?.("[data-i18n]") ? [scope] : []),
    ...(scope.querySelectorAll?.("[data-i18n]") || []),
  ];
  marked.forEach((element) => {
    element.textContent = translate(element.dataset.i18n, language);
  });
  const attributed = [
    ...(scope.matches?.("[data-i18n-placeholder], [data-i18n-aria-label], [placeholder], [aria-label], [title]") ? [scope] : []),
    ...(scope.querySelectorAll?.("[data-i18n-placeholder], [data-i18n-aria-label], [placeholder], [aria-label], [title]") || []),
  ];
  attributed.forEach((element) => {
    if (!originalAttributes.has(element)) originalAttributes.set(element, {
      placeholder: element.dataset.i18nPlaceholder || element.getAttribute("placeholder"),
      ariaLabel: element.dataset.i18nAriaLabel || element.getAttribute("aria-label"),
      title: element.getAttribute("title"),
    });
    const originals = originalAttributes.get(element);
    if (originals.placeholder !== null) element.setAttribute("placeholder", translate(originals.placeholder, language));
    if (originals.ariaLabel !== null) element.setAttribute("aria-label", translate(originals.ariaLabel, language));
    if (originals.title !== null) element.setAttribute("title", translate(originals.title, language));
  });
};

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

  translateMarkedElements(document, language);

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
  document.dispatchEvent(new CustomEvent("teenlaunch:languagechange", { detail: { language } }));
};

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-language-toggle]")) return;
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
    if (node.nodeType === Node.ELEMENT_NODE) {
      translateMarkedElements(node, currentLanguage);
      translateTextNodes(node, currentLanguage);
      const toggles = [
        ...(node.matches?.("[data-language-toggle]") ? [node] : []),
        ...(node.querySelectorAll?.("[data-language-toggle]") || []),
      ];
      const headerToggle = toggles.find((toggle) => !toggle.classList.contains("floating-language-toggle"));
      if (headerToggle) {
        document.querySelectorAll(".floating-language-toggle").forEach((toggle) => toggle.remove());
        languageToggle = headerToggle;
      }
      toggles.forEach((toggle) => {
        toggle.textContent = currentLanguage === "zh" ? "EN" : "中文";
        toggle.setAttribute("aria-label", currentLanguage === "zh" ? "Switch to English" : "Switch to Chinese");
      });
    }
    if (node.nodeType === Node.TEXT_NODE && node.parentElement) translateTextNodes(node.parentElement, currentLanguage);
  }));
}).observe(document.body, { childList: true, subtree: true });
