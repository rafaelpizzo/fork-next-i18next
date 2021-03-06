import PropTypes from "prop-types";
import { withTranslation } from "../i18n";

const Footer = ({ t }) => (
  <footer>
    <p>{t("description")}</p>
    <p>next-i18next v{version}</p>
  </footer>
);

Footer.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("footer")(Footer);
