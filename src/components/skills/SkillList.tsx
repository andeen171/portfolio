import SkillItem from "./SkillItem";

const SkillList: React.FC = () => {
  // Replace the `skills` array with the data fetched from your database
  const skills = [
    { id: 1, name: "React", description: "A JavaScript library for building user interfaces", image: "/path/to/image" },
    { id: 2, name: "TypeScript", description: "Typed superset of JavaScript that compiles to plain JavaScript", image: "/path/to/image" },
  ];

  return (
    <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
      {skills.map((skill) => (
        <SkillItem key={skill.id} skill={skill} />
      ))}
    </dl>
  );
};

export default SkillList
