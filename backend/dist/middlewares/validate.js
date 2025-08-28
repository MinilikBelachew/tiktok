const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error?.issues
            ? result.error.issues.map((issue) => issue.message)
            : ["Validation error"];
        return res.status(400).json({ message: errors });
    }
    req.body = result.data;
    next();
};
export default validate;
